
import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { BookOpen, Building } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Day, Lesson, Subject, WizardData } from '@/types';
import { getAvailableRoomsForSlot } from './utils';
import { findConflictingConstraint } from '@/lib/constraint-utils';
import { formatTimeSimple, timeToMinutes } from './utils';

interface InteractiveEmptyCellProps {
  day: Day;
  timeSlot: string;
  wizardData: WizardData;
 fullSchedule: Lesson[];
  onAddLesson: (subjectInfo: Pick<Subject, 'id' | 'name' | 'weeklyHours' | 'coefficient'>, day: Day, time: string) => Promise<void>;
  isDropDisabled?: boolean;
 setHoveredSubjectId: (subjectId: number | null) => void;
  viewMode: 'class' | 'teacher';
  selectedViewId: string;
  hoveredSubjectId: number | null;
}

const InteractiveEmptyCell: React.FC<InteractiveEmptyCellProps> = ({ 
  day, 
  timeSlot, 
  wizardData, 
  fullSchedule, 
  onAddLesson, 
  isDropDisabled = false, 
  viewMode, 
  selectedViewId, 
  setHoveredSubjectId,
  hoveredSubjectId,
}) => {

  const isSaturdayAfternoon = useMemo(() => {
    return day === 'SATURDAY' && timeToMinutes(timeSlot) >= 720; // 12:00 PM
  }, [day, timeSlot]);

  const isTeacherConstrained = useMemo(() => {
    if (!hoveredSubjectId) return false;

    const classIdNum = parseInt(selectedViewId, 10);
    if (viewMode !== 'class' || isNaN(classIdNum)) return false;

    const assignment = wizardData.teacherAssignments.find(a => 
      a.subjectId === hoveredSubjectId && a.classIds.includes(classIdNum)
    );
    if (!assignment) return false;
    
    const teacher = wizardData.teachers.find(t => t.id === assignment.teacherId);
    if (!teacher) return false;

    const lessonStartTime = timeSlot;
    const lessonEndTimeDate = new Date(Date.UTC(2000, 0, 1, ...lessonStartTime.split(':').map(Number) as [number, number]));
    lessonEndTimeDate.setMinutes(lessonEndTimeDate.getMinutes() + (wizardData.school?.sessionDuration || 60));
    const lessonEndTime = formatTimeSimple(lessonEndTimeDate);
    
    return !!findConflictingConstraint(teacher.id, day, lessonStartTime, lessonEndTime, wizardData.teacherConstraints);

  }, [hoveredSubjectId, day, timeSlot, wizardData, selectedViewId, viewMode]);

  const isDisabled = isDropDisabled || isTeacherConstrained || isSaturdayAfternoon;
  
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-${day}-${timeSlot}`,
    data: { day, time: timeSlot },
    disabled: isDisabled,
  });

  const availableRooms = useMemo(() => getAvailableRoomsForSlot(
    day, 
    timeSlot, 
    wizardData.school.sessionDuration || 60,
    wizardData, 
    fullSchedule
  ), [day, timeSlot, wizardData, fullSchedule]);
  
  const availableSubjects = React.useMemo(() => {
    if (viewMode !== 'class' || !selectedViewId || !wizardData.subjects || !wizardData.school) {
      return [];
    }
    const classIdNum = parseInt(selectedViewId, 10);
    
    const scheduledHoursBySubject = fullSchedule
      .filter(l => l.classId === classIdNum)
      .reduce((acc, l) => {
        const lessonDurationMinutes = (new Date(l.endTime).getTime() - new Date(l.startTime).getTime()) / (1000 * 60);
        const lessonHours = lessonDurationMinutes / 60; 
        acc[l.subjectId] = (acc[l.subjectId] || 0) + lessonHours;
        return acc;
      }, {} as Record<number, number>);

    return wizardData.subjects.filter(subject => {
      const requirement = wizardData.lessonRequirements?.find(r => 
        r.classId === classIdNum && r.subjectId === subject.id
      );
      const requiredHours = requirement ? requirement.hours : (subject.weeklyHours || 0);
      const scheduledHours = scheduledHoursBySubject[subject.id] || 0;
      return scheduledHours < requiredHours;
    });
  }, [fullSchedule, wizardData, selectedViewId, viewMode]);

  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "h-24 w-full rounded-md transition-colors relative group p-1", 
        isOver && !isDisabled && "bg-primary/20",
        isDisabled && 'bg-muted/50 cursor-not-allowed'
      )}
    >
      <div className={cn(
        "absolute bottom-1 right-1 flex gap-1 opacity-20 group-hover:opacity-100 transition-opacity",
        isDisabled && 'hidden'
      )}>
        {viewMode === 'class' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><BookOpen size={14} /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" onMouseLeave={() => setHoveredSubjectId(null)}>
              <h4 className="font-medium text-sm mb-2">Matières possibles</h4>
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {availableSubjects.length > 0 ? availableSubjects.map(subject => (
                    <Button 
                      key={subject.id} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start" 
                      onClick={() => onAddLesson(subject, day, timeSlot)}
                      onMouseEnter={() => setHoveredSubjectId(subject.id)}
                    >
                      {subject.name}
                    </Button>
                  )) : <p className="text-xs text-muted-foreground p-2">Aucune matière avec des heures restantes.</p>}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Building size={14} /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <h4 className="font-medium text-sm mb-2">Salles libres</h4>
            <ScrollArea className="max-h-48">
              <div className="space-y-1">
                {availableRooms.length > 0 ? availableRooms.map(room => (
                  <div key={room.id} className="text-sm p-1">{room.name}</div>
                )) : <p className="text-xs text-muted-foreground p-2">Aucune salle libre.</p>}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default InteractiveEmptyCell;
