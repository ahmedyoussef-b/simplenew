
import { useCallback } from 'react';
import { useAppDispatch } from '@/hooks/redux-hooks';
import { addLesson, removeLesson, saveSchedule, updateLessonSlot } from '@/lib/redux/features/schedule/scheduleSlice';
import { useToast } from '@/hooks/use-toast';
import type { Day, Lesson, Subject, WizardData } from '@/types';
import { findConflictingConstraint } from '@/lib/constraint-utils';
import { formatTimeSimple, timeToMinutes } from '../utils/scheduleUtils';
import { DragEndEvent } from '@dnd-kit/core';

export const useScheduleActions = (
  wizardData: WizardData,
  schedule: Lesson[],
  viewMode: 'class' | 'teacher',
  selectedClassId: string
) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handlePlaceLesson = useCallback((subject: Subject, day: Day, time: string) => {
    const { school, teachers, rooms, classes, teacherConstraints = [], subjectRequirements = [], teacherAssignments = [] } = wizardData;

    if (!school || school.sessionDuration === undefined) {
      toast({
        variant: "destructive",
        title: "Erreur de données",
        description: "Les informations sur l'école (durée de session) sont manquantes."
      });
      return;
    }

    if (viewMode !== 'class' || !selectedClassId) {
      toast({ 
        variant: "destructive", 
        title: "Action impossible", 
        description: "Veuillez sélectionner une classe avant d'ajouter un cours." 
      });
      return;
    }

    const [hour, minute] = time.split(':').map(Number);
    const classIdNum = parseInt(selectedClassId, 10);
    
    const assignment = teacherAssignments.find(a => a.subjectId === subject.id && a.classIds.includes(classIdNum));
    if (!assignment) {
      toast({ 
        variant: "destructive", 
        title: "Aucun enseignant assigné", 
        description: `Aucun enseignant n'est assigné pour enseigner "${subject.name}" à cette classe.` 
      });
      return;
    }

    const teacher = teachers.find(t => t.id === assignment.teacherId);
    if (!teacher) {
      toast({ 
        variant: "destructive", 
        title: "Enseignant introuvable", 
        description: `L'enseignant assigné pour "${subject.name}" est introuvable.` 
        });
      return;
    }
    
    const isTeacherBusy = schedule.some(l => 
      l.teacherId === teacher.id && 
      l.day === day && 
      formatTimeSimple(l.startTime) === time
    );
    
    if (isTeacherBusy) {
      toast({ 
        variant: "destructive", 
        title: "Enseignant occupé", 
        description: `${teacher.name} ${teacher.surname} a déjà un cours sur ce créneau.` 
      });
      return;
    }
    
    const lessonEndTimeDate = new Date(Date.UTC(0, 0, 1, hour, minute + school.sessionDuration));
    const lessonEndTimeStr = formatTimeSimple(lessonEndTimeDate);
    const constraint = findConflictingConstraint(
      teacher.id, 
      day, 
      time, 
      lessonEndTimeStr, 
      teacherConstraints
      );
      
    if (constraint) {
      toast({ 
        variant: "destructive", 
        title: "Enseignant indisponible", 
        description: `${teacher.name} ${teacher.surname} a une contrainte sur ce créneau.` 
      });
      return;
    }
    
    const lessonStartMinutes = timeToMinutes(time);
    const lessonEndMinutes = lessonStartMinutes + school.sessionDuration;

    const occupiedRoomIdsInSlot = new Set(
      schedule
        .filter(l => {
          if (l.classroomId == null || l.day !== day) return false;
          const otherLessonStart = timeToMinutes(formatTimeSimple(l.startTime));
          const otherLessonEnd = timeToMinutes(formatTimeSimple(l.endTime));
          // Check for overlap
          return lessonStartMinutes < otherLessonEnd && lessonEndMinutes > otherLessonStart;
        })
        .map(l => l.classroomId!)
    );
    
    let potentialRooms = rooms.filter(r => !occupiedRoomIdsInSlot.has(r.id));
    
    const subjectReq = subjectRequirements.find(r => r.subjectId === subject.id);
    if (subjectReq?.allowedRoomIds && subjectReq.allowedRoomIds.length > 0) {
      potentialRooms = potentialRooms.filter(r => subjectReq.allowedRoomIds!.includes(r.id));
      if (potentialRooms.length === 0) {
        toast({ 
          variant: "destructive", 
          title: "Salle requise occupée", 
          description: `La salle requise pour "${subject.name}" est occupée.` 
        });
        return;
      }
    }
    
    const availableRoom = potentialRooms.length > 0 ? potentialRooms[0] : null;

    const lessonStartTimeDate = new Date(Date.UTC(2000, 0, 1, hour, minute));

    const newLesson = {
      name: `${subject.name} - ${classes.find(c => c.id === classIdNum)?.name}`,
      day: day,
      startTime: lessonStartTimeDate.toISOString(),
      endTime: lessonEndTimeDate.toISOString(),
      subjectId: subject.id,
      classId: classIdNum,
      teacherId: teacher.id,
      classroomId: availableRoom ? availableRoom.id : null,
      scheduleDraftId: wizardData.scheduleDraftId,
    };

    dispatch(addLesson(newLesson));
    toast({ 
      title: "Cours ajouté", 
      description: `"${subject.name}" a été ajouté à l'emploi du temps.` 
    });
  }, [wizardData, schedule, selectedClassId, viewMode, dispatch, toast]);

 const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const overId = over.id.toString();
    const activeId = active.id.toString();
    
    if (activeId.startsWith('subject-')) {
        if (overId.startsWith('empty-')) {
            const subjectId = parseInt(active.id.toString().replace('subject-', ''), 10);
            const subject = wizardData.subjects.find(s => s.id === subjectId);
            if (!subject) return;

            const [, day, time] = over.id.toString().split('-');
            handlePlaceLesson(subject, day as Day, time);
        }
    } else if (activeId.startsWith('lesson-')) {
        if (overId.startsWith('empty-')) {
            const lessonId = parseInt(active.id.toString().replace('lesson-', ''));
            const [, newDay, newTime] = over.id.toString().split('-');
            dispatch(updateLessonSlot({ lessonId, newDay: newDay as Day, newTime }));
            toast({ title: "Cours déplacé" });
        }
    }
}, [dispatch, toast, wizardData, handlePlaceLesson]);


  const handleDeleteLesson = useCallback((lessonId: number) => {
    dispatch(removeLesson(lessonId));
  }, [dispatch]);

  const handleSaveChanges = useCallback(() => {
    dispatch(saveSchedule(schedule));
  }, [dispatch, schedule]);

  return {
    handleDragEnd,
    handlePlaceLesson,
    handleDeleteLesson,
    handleSaveChanges
  };
};
