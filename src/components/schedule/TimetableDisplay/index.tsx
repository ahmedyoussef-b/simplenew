// src/components/schedule/TimetableDisplay/index.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WizardData, Lesson, Subject, Day } from '@/types';
import { type Lesson as PrismaLesson } from '@prisma/client';
import { TimetableLessonCell, InteractiveEmptyCell } from './components/TimetableCells';
import { formatTimeSimple, getSubjectColorClass } from './components/utils';
import { generateTimeSlots } from '@/lib/time-utils';
import { mergeConsecutiveLessons } from '@/lib/lesson-utils';
import { dayLabels } from '@/lib/constants';
import { useScheduleActions } from '../ScheduleEditor/hooks/useScheduleActions';
import { useAppSelector } from '@/hooks/redux-hooks';
import { buildScheduleGrid } from './components/gridUtils';
import { cn } from '@/lib/utils';


interface TimetableDisplayProps {
  wizardData: WizardData | null;
  isEditable?: boolean;
  viewMode: 'class' | 'teacher';
  selectedViewId: string;
}

const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ 
    wizardData, 
    isEditable = false, 
    viewMode,
    selectedViewId,
}) => {
  const fullSchedule = useAppSelector((state) => state.schedule.items);
  const [hoveredSubjectId, setHoveredSubjectId] = useState<number | null>(null);


  const { handlePlaceLesson, handleDeleteLesson } = useScheduleActions(
    wizardData!, // Not null here because of the check below
    fullSchedule,
    viewMode,
    selectedViewId
  );

  if (!wizardData) {
      return <div>Chargement des données de configuration...</div>;
  }

  const schoolDays = (wizardData.school.schoolDays || []).map(dayKey => dayLabels[dayKey.toUpperCase() as keyof typeof dayLabels] || dayKey);
  const timeSlots = generateTimeSlots(
    wizardData.school.startTime, 
    wizardData.school.endTime || '18:00', 
    wizardData.school.sessionDuration || 60,
  );

  const dayMapping: { [key: string]: Day } = { 
    Lundi: 'MONDAY', 
    Mardi: 'TUESDAY', 
    Mercredi: 'WEDNESDAY', 
    Jeudi: 'THURSDAY', 
    Vendredi: 'FRIDAY', 
    Samedi: 'SATURDAY' 
  };
  
  const scheduleData = useMemo(() => {
    if (!fullSchedule) return [];
    if (viewMode === 'class' && selectedViewId) {
      return fullSchedule.filter(l => l.classId === parseInt(selectedViewId));
    }
    if (viewMode === 'teacher' && selectedViewId) {
      return fullSchedule.filter(l => l.teacherId === selectedViewId);
    }
    return [];
  }, [fullSchedule, viewMode, selectedViewId]);

  const { scheduleGrid, spannedSlots } = buildScheduleGrid(
    scheduleData, 
    wizardData, 
    timeSlots
  );

  const possibleSubjectsForClass = useMemo(() => {
    if (viewMode !== 'class' || !selectedViewId || !wizardData || !wizardData.lessonRequirements || !wizardData.subjects) return [];
    
    const classIdNum = parseInt(selectedViewId, 10);
    if (isNaN(classIdNum)) return [];

    const scheduledHoursBySubject = fullSchedule
        .filter(l => l.classId === classIdNum)
        .reduce((acc, l) => {
            const lessonDurationMinutes = (new Date(l.endTime).getTime() - new Date(l.startTime).getTime()) / (1000 * 60);
            const lessonHours = lessonDurationMinutes / 60;
            acc[l.subjectId] = (acc[l.subjectId] || 0) + lessonHours;
            return acc;
        }, {} as Record<number, number>);

    return wizardData.subjects.map(subject => {
        const requirement = wizardData.lessonRequirements?.find(r =>
            r.classId === classIdNum && r.subjectId === subject.id
        );
        const requiredHours = requirement ? requirement.hours : (subject.weeklyHours || 0);
        const scheduledHours = scheduledHoursBySubject[subject.id] || 0;
        return {
            subject,
            remainingHours: requiredHours - scheduledHours,
        };
    }).filter(item => item.remainingHours > 0);
  }, [fullSchedule, wizardData, selectedViewId, viewMode]);


  return (
      <Card className="p-4 print:shadow-none print:border-none">
          <div className="relative w-full overflow-auto">
          <Table className="min-w-full border-collapse">
              <TableHeader>
              <TableRow>
                  <TableHead className="w-20 border">Horaires</TableHead>
                  {schoolDays.map(day => <TableHead key={day} className="text-center border min-w-32">{day}</TableHead>)}
              </TableRow>
              </TableHeader>
              <TableBody>
              {timeSlots.map((time, timeIndex) => (
                  <TableRow key={time}>
                  <TableCell className="font-medium bg-muted/50 border h-24">{time}</TableCell>
                  {schoolDays.map((day, dayIndex) => {
                      const dayEnum = dayMapping[day as keyof typeof dayMapping];
                      if (!dayEnum) return null;
                      
                      const cellId = `${dayEnum}-${time}`;
                      const uniqueKey = `${cellId}-${dayIndex}-${timeIndex}`;

                      if (spannedSlots.has(cellId)) {
                          return null;
                      }

                      const cellData = scheduleGrid[cellId];
                      
                      if (cellData) {
                          return (
                          <TableCell 
                            key={uniqueKey} 
                            rowSpan={cellData.rowSpan} 
                            className={cn(
                              "p-0 border align-top relative",
                              getSubjectColorClass(cellData.lesson.subjectId)
                            )}
                          >
                              <TimetableLessonCell 
                                  lesson={cellData.lesson} 
                                  wizardData={wizardData} 
                                  onDelete={handleDeleteLesson} 
                                  isEditable={isEditable} 
                                  fullSchedule={fullSchedule}
                              />
                          </TableCell>
                          );
                      } else {
                          return (
                              <TableCell key={uniqueKey} className="p-0 border align-top">
                                  <InteractiveEmptyCell
                                      day={dayEnum}
                                      timeSlot={time}
                                      possibleSubjects={possibleSubjectsForClass}
                                      onAddLesson={handlePlaceLesson}
                                      wizardData={wizardData}
                                      fullSchedule={fullSchedule || []}
                                      isEditable={isEditable}
                                      setHoveredSubjectId={setHoveredSubjectId}
                                      hoveredSubjectId={hoveredSubjectId}
                                  />
                              </TableCell>
                          );
                      }
                  })}
                  </TableRow>
              ))}
              </TableBody>
          </Table>
          </div>
      </Card>
  );
};


export default TimetableDisplay;
