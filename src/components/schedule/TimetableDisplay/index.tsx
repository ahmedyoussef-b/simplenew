// src/components/schedule/TimetableDisplay/index.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { WizardData, Lesson, Subject, Day } from '@/types';
import { type Lesson as PrismaLesson } from '@prisma/client';
import LessonCell from './components/LessonCell';
import InteractiveEmptyCell from './components/InteractiveEmptyCell';
import { formatTimeSimple } from './components/utils';
import { generateTimeSlots } from '@/lib/time-utils';
import { mergeConsecutiveLessons } from '@/lib/lesson-utils';
import { dayLabels } from '@/lib/constants';
import { useScheduleActions } from '../ScheduleEditor/hooks/useScheduleActions';
import { useAppSelector } from '@/hooks/redux-hooks';

interface TimetableDisplayProps {
  wizardData: WizardData;
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
    wizardData,
    fullSchedule,
    viewMode,
    selectedViewId
  );

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
                          <TableCell key={uniqueKey} rowSpan={cellData.rowSpan} className="p-0 border align-top relative">
                              <LessonCell 
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
                                      viewMode={viewMode}
                                      selectedViewId={selectedViewId}
                                      wizardData={wizardData}
                                      fullSchedule={fullSchedule}
                                      onAddLesson={handlePlaceLesson}
                                      isDropDisabled={!isEditable}
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


function buildScheduleGrid(
  scheduleData: Lesson[],
  wizardData: WizardData,
  timeSlots: string[]
) {
  if (!Array.isArray(scheduleData)) {
     return { scheduleGrid: {}, spannedSlots: new Set() };
  }
  
  const scheduleWithDates: PrismaLesson[] = scheduleData.map(l => ({
    ...l,
    startTime: new Date(l.startTime),
    endTime: new Date(l.endTime),
    createdAt: new Date(l.createdAt),
    updatedAt: new Date(l.updatedAt),
  }));


  const mergedLessons = mergeConsecutiveLessons(scheduleWithDates, wizardData);
  const grid: Record<string, { lesson: Lesson, rowSpan: number }> = {};
  const localSpannedSlots = new Set<string>();

  mergedLessons.forEach((lesson) => {
    const day = lesson.day;
    const time = formatTimeSimple(lesson.startTime);
    const cellId = `${day}-${time}`;

    if (localSpannedSlots.has(cellId)) return;

    const startTime = new Date(lesson.startTime);
    const endTime = new Date(lesson.endTime);
    const durationInMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const rowSpan = Math.max(1, Math.round(durationInMinutes / (wizardData.school?.sessionDuration || 60)));

    const gridLesson: Lesson = {
      ...lesson,
      startTime: lesson.startTime.toISOString(),
      endTime: lesson.endTime.toISOString(),
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString(),
    };

    grid[cellId] = { lesson: gridLesson, rowSpan };

    if (rowSpan > 1) {
      for (let i = 1; i < rowSpan; i++) {
        const nextTimeSlotIndex = timeSlots.indexOf(time) + i;
        if (nextTimeSlotIndex < timeSlots.length) {
          const nextTimeSlot = timeSlots[nextTimeSlotIndex];
          localSpannedSlots.add(`${day}-${nextTimeSlot}`);
        }
      }
    }
  });

  return { scheduleGrid: grid, spannedSlots: localSpannedSlots };
}

export default TimetableDisplay;
