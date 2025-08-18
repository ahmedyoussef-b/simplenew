// src/lib/schedule-generation.ts
import type { WizardData, Day, Subject, Lesson, TeacherWithDetails, Classroom } from '@/types';
import { generateTimeSlots, formatTimeSimple, timeToMinutes } from './time-utils';
import { findConflictingConstraint } from './constraint-utils';
import { labSubjectKeywords } from './constants'; // Import keywords

type PlacedLesson = Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'> & {
    startTime: string; // Storing as ISO string
    endTime: string;   // Storing as ISO string
};

// --- CORE GENERATION LOGIC ---
export function generateSchedule(wizardData: WizardData): { schedule: Lesson[], unplacedLessons: any[] } {
  console.log("⚙️ [Generator V5] Démarrage de la génération par classe avec gestion des demi-groupes...");
  
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

  const sortedClasses = [...classes].sort((a, b) => {
    const aHours = lessonRequirements.filter(r => r.classId === a.id).reduce((sum, r) => sum + r.hours, 0);
    const bHours = lessonRequirements.filter(r => r.classId === b.id).reduce((sum, r) => sum + r.hours, 0);
    return bHours - aHours;
  });

  for (const classInfo of sortedClasses) {
    console.log(`--- 🗓️ Planification pour la classe : ${classInfo.name} ---`);
    let lessonsToPlace: Array<{ subjectInfo: Subject, teacherInfo: TeacherWithDetails, hours: number }> = [];
    
    subjects.forEach(subjectInfo => {
      const requirement = lessonRequirements.find(req => req.classId === classInfo.id && req.subjectId === subjectInfo.id);
      const hours = requirement ? requirement.hours : (subjectInfo.weeklyHours || 0);

      if (hours > 0) {
        const assignment = teacherAssignments.find(a => a.subjectId === subjectInfo.id && a.classIds.includes(classInfo.id));
        const teacherInfo = teachers.find(t => t.id === assignment?.teacherId);

        if (teacherInfo) {
          lessonsToPlace.push({ subjectInfo, teacherInfo, hours });
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

    // Step 1: Attempt to place paired lab sessions (demi-groupes)
    const labSubjectsToPlace = lessonsToPlace.filter(l => labSubjectKeywords.some(keyword => l.subjectInfo.name.toLowerCase().includes(keyword)));
    
    while (labSubjectsToPlace.length >= 2) {
      const lesson1 = labSubjectsToPlace.shift()!;
      const lesson2 = labSubjectsToPlace.shift()!;

      // For simplicity, we assume 1.5h + 1.5h = 3h block. This requires sessionDuration to be 90mins.
      // If a lesson is 3 hours, we need two 1.5h slots.
      const numBlocks = Math.floor(lesson1.hours / 1.5);
      
      for(let i = 0; i < numBlocks; i++){
          const placed = findAndPlaceSplitSession(schedule, classInfo, lesson1, lesson2, wizardData, timeSlots);
          if (!placed) {
              // If we can't place them as a pair, put them back to be placed individually.
              lessonsToPlace.push(lesson1, lesson2);
              break; // Stop trying to pair them
          }
      }
    }


    // Step 2: Place remaining lessons individually
    const remainingLessonsToPlaceFlat: Array<{ subjectInfo: Subject, teacherInfo: TeacherWithDetails }> = [];
    lessonsToPlace.forEach(({subjectInfo, teacherInfo, hours}) => {
        for(let i = 0; i < hours; i++) {
            remainingLessonsToPlaceFlat.push({subjectInfo, teacherInfo});
        }
    });

    remainingLessonsToPlaceFlat.sort(() => Math.random() - 0.5);

    for (const { subjectInfo, teacherInfo } of remainingLessonsToPlaceFlat) {
       placeIndividualLesson(schedule, classInfo, subjectInfo, teacherInfo, wizardData, timeSlots, unplacedLessons);
    }
  }

  const finalSchedule: Lesson[] = schedule.map((l, index) => ({
      ...l,
      id: -(index + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
  }));

  console.log(`✅ [Generator V5] Génération terminée. ${finalSchedule.length} sessions placées.`);
  if (unplacedLessons.length > 0) {
    console.warn(`⚠️ [Generator V5] ${unplacedLessons.length} sessions n'ont pas pu être placées.`, unplacedLessons);
  }

  return { schedule: finalSchedule, unplacedLessons };
}

// --- HELPER FUNCTIONS ---

function findAndPlaceSplitSession(
    schedule: PlacedLesson[],
    classInfo: any,
    lesson1: any,
    lesson2: any,
    wizardData: WizardData,
    timeSlots: string[]
): boolean {
    const { school, teachers, rooms, teacherConstraints } = wizardData;
    const sessionDuration = school.sessionDuration || 60;
    const requiredBlockDuration = 180; // 3 hours in minutes

    const shuffledDays = [...(school.schoolDays || [])].sort(() => Math.random() - 0.5);

    for (const day of shuffledDays) {
        const dayEnum = day.toUpperCase() as Day;
        const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

        for (const time of shuffledTimes) {
            const blockStartMinutes = timeToMinutes(time);
            const blockEndMinutes = blockStartMinutes + requiredBlockDuration;

            // Check if this 3-hour block is free for the CLASS
            const isClassBusy = schedule.some(l => {
                if (l.classId !== classInfo.id || l.day !== dayEnum) return false;
                const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
                const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
                return blockStartMinutes < existingEnd && blockEndMinutes > existingStart;
            });
            if (isClassBusy) continue;
            
            // Check if TEACHERS are free
            const teacher1 = lesson1.teacherInfo;
            const teacher2 = lesson2.teacherInfo;
            if (isTeacherBusy(schedule, teacher1.id, dayEnum, blockStartMinutes, blockEndMinutes) || isTeacherBusy(schedule, teacher2.id, dayEnum, blockStartMinutes, blockEndMinutes)) {
                continue;
            }

            // Find two available LABS
            const occupiedRoomIdsInSlot = new Set(schedule.filter(l => {
                if (l.day !== dayEnum) return false;
                const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
                const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
                return blockStartMinutes < existingEnd && blockEndMinutes > existingStart;
            }).map(l => l.classroomId).filter((id): id is number => id !== null));

            const availableLabs = rooms.filter(r => 
                !occupiedRoomIdsInSlot.has(r.id) && 
                (labSubjectKeywords.some(k => r.name.toLowerCase().includes(k)) || r.name.toLowerCase().includes('lab'))
            );

            if (availableLabs.length < 2) continue; // Need at least two free labs

            const lab1 = availableLabs[0];
            const lab2 = availableLabs[1];

            // --- ALL CHECKS PASSED, PLACE THE SPLIT SESSIONS ---

            const startTime1 = new Date(Date.UTC(2000, 0, 1, ...time.split(':').map(Number) as [number, number]));
            const midTime = new Date(startTime1.getTime() + 90 * 60 * 1000);
            const endTime = new Date(midTime.getTime() + 90 * 60 * 1000);

            // Permutation 1
            schedule.push({
                name: `${lesson1.subjectInfo.name} - ${classInfo.name} (Groupe A)`, day: dayEnum, startTime: startTime1.toISOString(), endTime: midTime.toISOString(),
                subjectId: lesson1.subjectInfo.id, classId: classInfo.id, teacherId: teacher1.id, classroomId: lab1.id, scheduleDraftId: wizardData.scheduleDraftId || null,
            });
            schedule.push({
                name: `${lesson2.subjectInfo.name} - ${classInfo.name} (Groupe B)`, day: dayEnum, startTime: startTime1.toISOString(), endTime: midTime.toISOString(),
                subjectId: lesson2.subjectInfo.id, classId: classInfo.id, teacherId: teacher2.id, classroomId: lab2.id, scheduleDraftId: wizardData.scheduleDraftId || null,
            });

            // Permutation 2 (Swap)
            schedule.push({
                name: `${lesson2.subjectInfo.name} - ${classInfo.name} (Groupe A)`, day: dayEnum, startTime: midTime.toISOString(), endTime: endTime.toISOString(),
                subjectId: lesson2.subjectInfo.id, classId: classInfo.id, teacherId: teacher2.id, classroomId: lab2.id, scheduleDraftId: wizardData.scheduleDraftId || null,
            });
            schedule.push({
                name: `${lesson1.subjectInfo.name} - ${classInfo.name} (Groupe B)`, day: dayEnum, startTime: midTime.toISOString(), endTime: endTime.toISOString(),
                subjectId: lesson1.subjectInfo.id, classId: classInfo.id, teacherId: teacher1.id, classroomId: lab1.id, scheduleDraftId: wizardData.scheduleDraftId || null,
            });

            return true; // Successfully placed
        }
    }
    return false; // Could not place
}


function placeIndividualLesson(
    schedule: PlacedLesson[],
    classInfo: any,
    subjectInfo: Subject,
    teacherInfo: TeacherWithDetails,
    wizardData: WizardData,
    timeSlots: string[],
    unplacedLessons: any[]
) {
  const { school, rooms, teacherConstraints, subjectRequirements } = wizardData;
  let placed = false;
  const shuffledDays = [...(school.schoolDays || [])].sort(() => Math.random() - 0.5);

  const dayOrder: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  for (const day of shuffledDays) {
    if (placed) break;
    const dayEnum = day.toUpperCase() as Day;
    
    // Find the previous day
    const currentDayIndex = dayOrder.indexOf(dayEnum);
    const previousDay = currentDayIndex > 0 ? dayOrder[currentDayIndex - 1] : null;

    // New constraint check: Was this subject taught to this class yesterday?
    if (previousDay) {
        const wasTaughtYesterday = schedule.some(l => 
            l.classId === classInfo.id &&
            l.subjectId === subjectInfo.id &&
            l.day === previousDay
        );
        if (wasTaughtYesterday) {
            continue; // Skip this day for this subject
        }
    }

    const shuffledTimes = [...timeSlots].sort(() => Math.random() - 0.5);

    for (const time of shuffledTimes) {
      const lessonStartMinutes = timeToMinutes(time);
      const lessonDuration = school.sessionDuration || 60;
      const lessonEndMinutes = lessonStartMinutes + lessonDuration;

      // --- Constraint Checks ---
      if (isClassBusy(schedule, classInfo.id, dayEnum, lessonStartMinutes, lessonEndMinutes) || 
          isTeacherBusy(schedule, teacherInfo.id, dayEnum, lessonStartMinutes, lessonEndMinutes)) {
        continue;
      }

      const lessonEndTimeStr = formatTimeSimple(new Date(Date.UTC(2000, 0, 1, 0, lessonEndMinutes)));
      if (findConflictingConstraint(teacherInfo.id, dayEnum, time, lessonEndTimeStr, teacherConstraints || [])) {
        continue;
      }
      
      const subjectReq = subjectRequirements.find(r => r.subjectId === subjectInfo.id);
      if (subjectReq?.timePreference === 'AM' && lessonStartMinutes >= 720) continue;
      if (subjectReq?.timePreference === 'PM' && lessonStartMinutes < 720) continue;

      // --- Room Allocation ---
      const occupiedRoomIdsInSlot = new Set(schedule.filter(l => {
          if (l.day !== dayEnum) return false;
          const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
          const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
          return lessonStartMinutes < existingEnd && lessonEndMinutes > existingStart;
      }).map(l => l.classroomId).filter((id): id is number => id !== null));

      let potentialRooms = rooms.filter(r => !occupiedRoomIdsInSlot.has(r.id));
      if (subjectReq?.allowedRoomIds && subjectReq.allowedRoomIds.length > 0) {
        potentialRooms = potentialRooms.filter(r => subjectReq.allowedRoomIds!.includes(r.id));
        if (potentialRooms.length === 0) continue;
      }
      
      const chosenRoom = potentialRooms[0] || null;

      // --- Place Lesson ---
      const lessonStartTimeDate = new Date(Date.UTC(2000, 0, 1, ...time.split(':').map(Number) as [number, number]));
      const lessonEndTimeDate = new Date(lessonStartTimeDate.getTime() + lessonDuration * 60 * 1000);

      const newLesson: PlacedLesson = {
        name: `${subjectInfo.name} - ${classInfo.name}`,
        day: dayEnum,
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
      break;
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

const isClassBusy = (schedule: PlacedLesson[], classId: number, day: Day, start: number, end: number) => {
    return schedule.some(l => {
        if (l.classId !== classId || l.day !== day) return false;
        const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
        const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
        return start < existingEnd && end > existingStart;
    });
};

const isTeacherBusy = (schedule: PlacedLesson[], teacherId: string, day: Day, start: number, end: number) => {
    return schedule.some(l => {
        if (l.teacherId !== teacherId || l.day !== day) return false;
        const existingStart = timeToMinutes(formatTimeSimple(l.startTime));
        const existingEnd = timeToMinutes(formatTimeSimple(l.endTime));
        return start < existingEnd && end > existingStart;
    });
};
