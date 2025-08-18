// src/components/schedule/TimetableDisplay/components/LessonCell.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { Lesson, WizardData } from '@/types';
import RoomSelectorPopover from './RoomSelectorPopover';
import { formatTimeSimple, getSubjectColorClass } from './utils';

interface LessonCellProps {
  lesson: Lesson;
  wizardData: WizardData;
  onDelete: (id: number) => void;
  isEditable: boolean;
  fullSchedule: Lesson[];
}

const LessonCell: React.FC<LessonCellProps> = ({ 
  lesson, 
  wizardData, 
  onDelete, 
  isEditable, 
  fullSchedule 
}) => {
  const getSubjectName = (lesson: Lesson) => {
    if (lesson.subjectId) {
      return wizardData.subjects?.find(s => s.id === lesson.subjectId)?.name || 'N/A';
    }
    if (lesson.optionalSubjectId) {
      // Logic for optional subject display will be handled by the parent component
      return "Matière Option";
    }
    return 'N/A';
  };
  const getTeacherName = (id: string) => {
    const teacher = wizardData.teachers?.find(t => t.id === id);
    return teacher ? `${teacher.name?.charAt(0)}. ${teacher.surname}` : 'N/A';
  };
  const getClassName = (id: number) => wizardData.classes?.find(c => c.id === id)?.name || 'N/A';
  const getRoomName = (id: number | null) => {
    if (id === null) return 'N/A';
    const rooms = wizardData?.rooms ?? [];
    return rooms.find(r => r.id === id)?.name || 'N/A';
  }
  
  return (
    <div 
      className={cn(
        `h-full w-full p-2 text-xs flex flex-col justify-center transition-colors group`
      )}
    >
      {isEditable && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }}
            className="absolute top-0 left-0 p-0.5 bg-destructive/80 text-destructive-foreground rounded-br-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer ce cours"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <RoomSelectorPopover 
            lesson={lesson} 
            day={lesson.day} 
            timeSlot={formatTimeSimple(lesson.startTime)} 
            wizardData={wizardData} 
            fullSchedule={fullSchedule} 
          />
        </>
      )}
      <div className="font-semibold text-foreground">{getSubjectName(lesson)}</div>
      <div className="text-xs text-muted-foreground">{getTeacherName(lesson.teacherId)}</div>
      <div className="text-xs text-muted-foreground">Cl: {getClassName(lesson.classId)}</div>
      <div className="text-xs text-muted-foreground">Salle: {getRoomName(lesson.classroomId)}</div>
    </div>
  );
};

export default LessonCell;
