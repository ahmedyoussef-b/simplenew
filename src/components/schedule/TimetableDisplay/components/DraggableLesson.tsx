
import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { Lesson, WizardData } from '@/types';
import RoomSelectorPopover from './RoomSelectorPopover';
import { formatTimeSimple, getSubjectColorClass } from './utils';

interface DraggableLessonProps {
  lesson: Lesson;
  wizardData: WizardData;
  onDelete: (id: number) => void;
  isEditable: boolean;
  fullSchedule: Lesson[];
}

const DraggableLesson: React.FC<DraggableLessonProps> = ({ 
  lesson, 
  wizardData, 
  onDelete, 
  isEditable, 
  fullSchedule 
}) => {
  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
    id: `lesson-${lesson.id}`,
    data: { lesson },
    disabled: !isEditable,
  });
  
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: `lesson-${lesson.id}`,
    data: { lesson }
  });

  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 10,
  } : undefined;

  const getSubjectName = (id: number) => wizardData.subjects?.find(s => s.id === id)?.name || 'N/A';
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
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className={cn(
        `absolute inset-1 p-2 rounded-md border text-xs flex flex-col justify-center transition-colors group cursor-grab`, 
        getSubjectColorClass(lesson.subjectId), 
        isOver && 'ring-2 ring-primary', 
        isDragging && 'opacity-50 shadow-lg'
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
      <div className="font-semibold text-foreground">{getSubjectName(lesson.subjectId)}</div>
      <div className="text-xs text-muted-foreground">{getTeacherName(lesson.teacherId)}</div>
      <div className="text-xs text-muted-foreground">Cl: {getClassName(lesson.classId)}</div>
      <div className="text-xs text-muted-foreground">Salle: {getRoomName(lesson.classroomId)}</div>
    </div>
  );
};

export default DraggableLesson;
