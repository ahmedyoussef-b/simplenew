// src/lib/schedule-generation.ts
import type { WizardData, Day, Subject, Lesson, TeacherWithDetails, Classroom } from '@/types';
import { generateTimeSlots, formatTimeSimple, timeToMinutes } from './time-utils';
import { findConflictingConstraint } from './constraint-utils';

type PlacedLesson = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> & {
    startTime: string; // Storing as ISO string
    endTime: string;   // Storing as ISO string
};

// --- CORE GENERATION LOGIC ---
export function generateSchedule(wizardData: WizardData): { schedule: Lesson[], unplacedLessons: any[] } {
  console.log("⚙️ [Generator V4] Démarrage de la génération par classe...");
  
  const { 
    school, 
    classes, 
    subjects, 
    teachers, 
    rooms, 
    lessonRequirements, 
    teacherAssignments, 
    teacherConstraints, 
    subjectRequirements 
  } = wizardData;

  let schedule: PlacedLesson[] = [];
  const unplacedLessons: any[] = [];
  const timeSlots = generateTimeSlots(school.startTime, school.endTime || '18:00', school.sessionDuration || 60);

  // Sort classes to prioritize those with more constraints or hours
  const sortedClasses = [...classes].sort((a, b) => {
    const aHours = lessonRequirements.filter(r => r.classId === a.id).reduce((sum, r) => sum + r.hours, 0);
    const bHours = lessonRequirements.filter(r => r.classId === b.id).reduce((sum, r) => sum + r.hours, 0);
    return bHours - aHours;
  });

  for (const classInfo of sortedClasses) {
    console.log(`--- 🗓️ Planification pour la classe : ${classInfo.name} ---`);
    const lessonsToPlaceForClass: Array<{ subjectInfo: Subject, teacherInfo: TeacherWithDetails }> = [];
    
    subjects.forEach(subjectInfo => {
      const requirement = lessonRequirements.find(req => req.classId === classInfo.id && req.subjectId === subjectInfo.id);
      const hours = requirement ? requirement.hours : (subjectInfo.weeklyHours || 0);

      if (hours > 0) {
        const assignment = teacherAssignments.find(a => a.subjectId === subjectInfo.id && a.classIds.includes(classInfo.id));
        const teacherInfo = teachers.find(t => t.id === assignment?.teacherId);

        if (teacherInfo) {
          for (let i = 0; i < hours; i++) {
            lessonsToPlaceForClass.push({ subjectInfo, teacherInfo });
          }
        } else {
           for (let i = 0; i < hours; i++) {
             unplacedLessons.push({
                class: classInfo.name,
                subject: subjectInfo.name,
                reason: `Aucun professeur assigné pour cette matière.`,
             });
           }
        }
      }
    });

    // Shuffle lessons for this class to avoid patterns
    lessonsToPlaceForClass.sort(() => Math.random() - 0.5);

    for (const lessonToPlace of lessonsToPlaceForClass) {
      const { subjectInfo, teacherInfo } = lessonToPlace;
      let placed = false;
      const shuffledDays = [...(school.schoolDays || [])].sort(() => Math.random() - 0.5);

      for (const day of shuffledDays) {
        if (placed) break;
        const dayEnum = day.toUpperCase() as Day;
        const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

        for (const time of shuffledTimes) {
          const lessonStartMinutes = timeToMinutes(time);

          // Hardcoded constraint: No courses on Saturday afternoon
          if (dayEnum === 'SATURDAY' && lessonStartMinutes >= 720) { // 720 minutes = 12:00 PM
            continue;
          }

          // Check if class is busy
          const isClassBusy = schedule.some(l => {
              if (l.classId !== classInfo.id || l.day !== dayEnum) return false;
              const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
              const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
              return lessonStartMinutes < existingEnd && (lessonStartMinutes + (school.sessionDuration || 60)) > existingStart;
          });
          if (isClassBusy) continue;

          // Check if teacher is busy
          const isTeacherBusy = schedule.some(l => {
              if (l.teacherId !== teacherInfo.id || l.day !== dayEnum) return false;
              const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
              const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
              return lessonStartMinutes < existingEnd && (lessonStartMinutes + (school.sessionDuration || 60)) > existingStart;
          });
          if (isTeacherBusy) continue;
          
          const lessonEndTimeDate = new Date(Date.UTC(2000, 0, 1, ...time.split(':').map(Number) as [number, number]));
          lessonEndTimeDate.setMinutes(lessonEndTimeDate.getMinutes() + (school.sessionDuration || 60));
          const lessonEndTimeStr = formatTimeSimple(lessonEndTimeDate);

          if (findConflictingConstraint(teacherInfo.id, dayEnum, time, lessonEndTimeStr, teacherConstraints || [])) continue;

          const subjectReq = subjectRequirements.find(r => r.subjectId === subjectInfo.id);
          if (subjectReq?.timePreference === 'AM' && lessonStartMinutes >= 720) continue;
          if (subjectReq?.timePreference === 'PM' && lessonStartMinutes < 720) continue;

          // --- ROOM ALLOCATION LOGIC ---
          const occupiedRoomIdsInSlot = new Set(schedule.filter(l => {
            if (l.day !== dayEnum) return false;
            const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
            const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
            return lessonStartMinutes < existingEnd && (lessonStartMinutes + (school.sessionDuration || 60)) > existingStart;
          }).map(l => l.classroomId).filter((id): id is number => id !== null));
          
          let chosenRoom: Classroom | null = null;
          let potentialRooms = rooms.filter(r => !occupiedRoomIdsInSlot.has(r.id));
          
          // Filter by allowed rooms if specified
          if (subjectReq?.allowedRoomIds && subjectReq.allowedRoomIds.length > 0) {
              potentialRooms = potentialRooms.filter(r => subjectReq.allowedRoomIds!.includes(r.id));
              if (potentialRooms.length === 0) {
                  continue; // No allowed rooms are available
              }
          }
          
          // If there are potential rooms, pick the first one (or add more logic here)
          if(potentialRooms.length > 0) {
              chosenRoom = potentialRooms[0];
          } else {
              continue; // No rooms available at all
          }


          const lessonStartTimeDate = new Date(Date.UTC(2000, 0, 1, ...time.split(':').map(Number) as [number, number]));

          const newLesson: PlacedLesson = {
            name: `${subjectInfo.name} - ${classInfo.name}`,
            day: day.toUpperCase() as Day,
            startTime: lessonStartTimeDate.toISOString(),
            endTime: lessonEndTimeDate.toISOString(),
            subjectId: subjectInfo.id,
            classId: classInfo.id,
            teacherId: teacherInfo.id,
            classroomId: chosenRoom?.id ?? null,
            scheduleDraftId: wizardData.scheduleDraftId || null,
          };

          schedule.push(newLesson);
          placed = true;
          break; // Exit time slot loop
        }
      }

      if (!placed) {
        unplacedLessons.push({
          class: classInfo.name,
          subject: subjectInfo.name,
          teacher: `${teacherInfo.name} ${teacherInfo.surname}`,
          reason: "Aucun créneau compatible n'a été trouvé.",
        });
      }
    }
  }

  const finalSchedule: Lesson[] = schedule.map((l, index) => ({
      ...l,
      id: -(index + 1), // Assign temporary negative IDs
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
  }));

  console.log(`✅ [Generator V4] Génération terminée. ${finalSchedule.length} sessions placées.`);
  if (unplacedLessons.length > 0) {
    console.warn(`⚠️ [Generator V4] ${unplacedLessons.length} sessions n'ont pas pu être placées.`, unplacedLessons);
  }

  return { schedule: finalSchedule, unplacedLessons };
}
