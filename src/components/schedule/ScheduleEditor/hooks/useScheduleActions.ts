// src/components/schedule/ScheduleEditor/hooks/useScheduleActions.ts
import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { toast } from '@/hooks/use-toast';
import type { Day, Lesson, Subject, WizardData, Class, Teacher } from '@/types';
import { findConflictingConstraint } from '@/lib/constraint-utils';
import { formatTimeSimple, timeToMinutes } from '../utils/scheduleUtils';
import { 
    useCreateLessonMutation,
    useUpdateLessonMutation,
    useDeleteLessonMutation 
} from '@/lib/redux/api/entityApi';

export const useScheduleActions = (
  wizardData: WizardData,
  schedule: Lesson[],
  viewMode: 'class' | 'teacher',
  selectedViewId: string // This can be either classId or teacherId
) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const handlePlaceLesson = useCallback(async (subject: Subject, day: Day, time: string) => {
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

    const [hour, minute] = time.split(':').map(Number);
    const lessonStartTimeDate = new Date(Date.UTC(2000, 0, 1, hour, minute));
    const lessonEndTimeDate = new Date(lessonStartTimeDate.getTime() + school.sessionDuration * 60 * 1000);
    const lessonEndTimeStr = formatTimeSimple(lessonEndTimeDate);
    
    // Perform all checks...
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

    const newLessonPayload = {
      name: `${subject.name} - ${classInfo.name}`,
      day: day,
      startTime: formatTimeSimple(lessonStartTimeDate),
      endTime: formatTimeSimple(lessonEndTimeDate),
      subjectId: subject.id,
      classId: classInfo.id,
      teacherId: teacherInfo.id,
      classroomId: availableRoom ? availableRoom.id : null,
    };

    try {
      await createLesson(newLessonPayload).unwrap();
      toast({ title: "Cours ajouté", description: `"${subject.name}" a été ajouté à l'emploi du temps.` });
    } catch (error: any) {
       toast({ variant: "destructive", title: "Erreur", description: error.data?.message || "Impossible d'ajouter le cours." });
    }
  }, [wizardData, schedule, selectedViewId, viewMode, createLesson, toast]);

  const handleDeleteLesson = useCallback(async (lessonId: number) => {
    try {
      await deleteLesson(lessonId).unwrap();
      toast({ title: "Cours supprimé", description: "Le cours a été retiré de l'emploi du temps." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.data?.message || "Impossible de supprimer le cours." });
    }
  }, [deleteLesson, toast]);

  const handleUpdateLessonSlot = useCallback(async (lessonId: number, newDay: Day, newTime: string) => {
    const lessonToUpdate = schedule.find(l => l.id === lessonId);
    if (!lessonToUpdate) return;
    
    const durationMs = new Date(lessonToUpdate.endTime).getTime() - new Date(lessonToUpdate.startTime).getTime();
    const newStartTime = new Date(Date.UTC(2000, 0, 1, ...newTime.split(':').map(Number) as [number, number]));
    const newEndTime = new Date(newStartTime.getTime() + durationMs);

    const updatedPayload = {
        id: lessonId,
        day: newDay,
        startTime: formatTimeSimple(newStartTime),
        endTime: formatTimeSimple(newEndTime),
    };

    try {
        await updateLesson(updatedPayload).unwrap();
        toast({ title: "Cours déplacé", description: "Le cours a été déplacé avec succès." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Erreur de déplacement", description: error.data?.message || "Impossible de déplacer le cours." });
    }
  }, [schedule, updateLesson, toast]);

  return {
    handlePlaceLesson,
    handleDeleteLesson,
    handleUpdateLessonSlot
  };
};
