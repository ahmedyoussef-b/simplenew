// src/components/schedule/ScheduleEditor/hooks/useScheduleActions.ts

import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addLesson, removeLesson, saveSchedule } from '@/lib/redux/features/schedule/scheduleSlice';
import { useToast } from '@/hooks/use-toast';
import type { Day, Lesson, Subject, WizardData, Class, Teacher } from '@/types';
import { findConflictingConstraint } from '@/lib/constraint-utils';
import { formatTimeSimple, timeToMinutes } from '../utils/scheduleUtils';

export const useScheduleActions = (
  wizardData: WizardData,
  schedule: Lesson[],
  viewMode: 'class' | 'teacher',
  selectedViewId: string // This can be either classId or teacherId
) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handlePlaceLesson = useCallback((subject: Subject, day: Day, time: string) => {
    const { school, teachers, rooms, classes, teacherConstraints = [], subjectRequirements = [], teacherAssignments = [] } = wizardData;

    if (!school?.sessionDuration) {
      toast({ variant: "destructive", title: "Erreur de configuration", description: "La durée de session de l'école n'est pas définie." });
      return;
    }
    
    // --- Determine Class and Teacher based on viewMode ---
    let classInfo: Class | undefined;
    let teacherInfo: Teacher | undefined;
    
    if (viewMode === 'class') {
      const classIdNum = parseInt(selectedViewId, 10);
      classInfo = classes.find(c => c.id === classIdNum);
      if (classInfo) {
        const assignment = teacherAssignments.find(a => a.subjectId === subject.id && a.classIds.includes(classIdNum));
        teacherInfo = teachers.find(t => t.id === assignment?.teacherId);
      }
    } else { // viewMode is 'teacher'
      teacherInfo = teachers.find(t => t.id === selectedViewId);
      // We need to infer the class. This is tricky. Let's find a class assigned to this teacher for this subject.
      // This logic assumes a simple 1-teacher-1-subject-to-N-classes model for manual add.
      // A more complex UI might be needed for other cases.
      const assignment = teacherAssignments.find(a => a.teacherId === selectedViewId && a.subjectId === subject.id);
      if (assignment?.classIds.length === 1) {
        classInfo = classes.find(c => c.id === assignment.classIds[0]);
      } else if (assignment?.classIds.length > 1) {
          toast({ variant: "destructive", title: "Classe ambiguë", description: "Ce professeur enseigne cette matière à plusieurs classes. Veuillez ajouter le cours depuis la vue 'Par Classe'." });
          return;
      }
    }

    if (!classInfo) {
      toast({ variant: "destructive", title: "Action impossible", description: "Impossible de déterminer la classe pour ce cours. Essayez depuis la vue 'Par Classe'." });
      return;
    }
    
    if (!teacherInfo) {
      toast({ variant: "destructive", title: "Aucun enseignant assigné", description: `Aucun enseignant n'est assigné pour enseigner "${subject.name}" à la classe "${classInfo.name}".` });
      return;
    }
    // --- End Determination Logic ---

    const [hour, minute] = time.split(':').map(Number);
    const lessonStartTimeDate = new Date(Date.UTC(2000, 0, 1, hour, minute));
    const lessonEndTimeDate = new Date(lessonStartTimeDate.getTime() + school.sessionDuration * 60 * 1000);
    const lessonEndTimeStr = formatTimeSimple(lessonEndTimeDate);
    
    // Check Teacher Availability
    const isTeacherBusy = schedule.some(l => 
      l.teacherId === teacherInfo!.id && 
      l.day === day && 
      new Date(l.startTime) < lessonEndTimeDate &&
      new Date(l.endTime) > lessonStartTimeDate
    );
    if (isTeacherBusy) {
      toast({ variant: "destructive", title: "Enseignant occupé", description: `${teacherInfo.name} ${teacherInfo.surname} a déjà un cours sur ce créneau.` });
      return;
    }
    if (findConflictingConstraint(teacherInfo.id, day, time, lessonEndTimeStr, teacherConstraints)) {
      toast({ variant: "destructive", title: "Enseignant indisponible", description: `${teacherInfo.name} ${teacherInfo.surname} a une contrainte sur ce créneau.` });
      return;
    }
    
    // Check Class Availability
    const isClassBusy = schedule.some(l => 
      l.classId === classInfo!.id && 
      l.day === day && 
      new Date(l.startTime) < lessonEndTimeDate &&
      new Date(l.endTime) > lessonStartTimeDate
    );
    if (isClassBusy) {
      toast({ variant: "destructive", title: "Classe occupée", description: `La classe ${classInfo.name} a déjà un cours sur ce créneau.` });
      return;
    }
    
    // Check Subject Time Preference
    const subjectReq = subjectRequirements.find(r => r.subjectId === subject.id);
    const lessonStartMinutes = timeToMinutes(time);
    if (subjectReq?.timePreference === 'AM' && lessonStartMinutes >= 720) {
      toast({ variant: "destructive", title: "Préférence horaire", description: `"${subject.name}" doit être placé le matin.` });
      return;
    }
    if (subjectReq?.timePreference === 'PM' && lessonStartMinutes < 720) {
      toast({ variant: "destructive", title: "Préférence horaire", description: `"${subject.name}" doit être placé l'après-midi.` });
      return;
    }

    // --- ROOM ALLOCATION LOGIC ---
    const occupiedRoomIdsInSlot = new Set(
      schedule.filter(l => {
          if (l.classroomId == null || l.day !== day) return false;
          const existingStart = new Date(l.startTime);
          const existingEnd = new Date(l.endTime);
          return lessonStartTimeDate < existingEnd && lessonEndTimeDate > existingStart;
        }).map(l => l.classroomId!)
    );
    
    let potentialRooms = rooms.filter(r => !occupiedRoomIdsInSlot.has(r.id));
    
    if (subjectReq?.allowedRoomIds && subjectReq.allowedRoomIds.length > 0) {
      potentialRooms = potentialRooms.filter(r => subjectReq.allowedRoomIds!.includes(r.id));
      if (potentialRooms.length === 0) {
        toast({ variant: "destructive", title: "Salle requise occupée", description: `La salle requise pour "${subject.name}" est occupée.` });
        return;
      }
    }
    
    const availableRoom = potentialRooms[0] || null;

    const newLesson = {
      name: `${subject.name} - ${classInfo.name}`,
      day: day,
      startTime: lessonStartTimeDate.toISOString(),
      endTime: lessonEndTimeDate.toISOString(),
      subjectId: subject.id,
      classId: classInfo.id,
      teacherId: teacherInfo.id,
      classroomId: availableRoom ? availableRoom.id : null,
      scheduleDraftId: wizardData.scheduleDraftId,
    };

    dispatch(addLesson(newLesson));
    toast({ title: "Cours ajouté", description: `"${subject.name}" a été ajouté à l'emploi du temps.` });
  }, [wizardData, schedule, selectedViewId, viewMode, dispatch, toast]);

  const handleDeleteLesson = useCallback((lessonId: number) => {
    dispatch(removeLesson(lessonId));
  }, [dispatch]);

  const handleSaveChanges = useCallback(() => {
    dispatch(saveSchedule(schedule));
  }, [dispatch, schedule]);

  return {
    handlePlaceLesson,
    handleDeleteLesson,
    handleSaveChanges
  };
};
