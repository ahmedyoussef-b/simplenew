// src/components/schedule/TimetableDisplay/components/gridUtils.ts

import type { Lesson, WizardData, Day } from '@/types';
import { formatTimeSimple, timeToMinutes } from '@/lib/time-utils';

interface ScheduleCell {
  lesson: Lesson;
  rowSpan: number;
}

interface ScheduleGrid {
  [key: string]: ScheduleCell;
}

export const buildScheduleGrid = (
  scheduleData: Lesson[],
  wizardData: WizardData,
  timeSlots: string[]
): { scheduleGrid: ScheduleGrid, spannedSlots: Set<string> } => {
  const scheduleGrid: ScheduleGrid = {};
  const spannedSlots = new Set<string>();

  scheduleData.forEach((lesson) => {
    const startTimeStr = formatTimeSimple(lesson.startTime);
    const endTimeStr = formatTimeSimple(lesson.endTime);
    
    const startMinutes = timeToMinutes(startTimeStr);
    const endMinutes = timeToMinutes(endTimeStr);
    const duration = endMinutes - startMinutes;
    
    const rowSpan = Math.max(1, Math.round(duration / (wizardData.school.sessionDuration || 60)));
    const cellId = `${lesson.day}-${startTimeStr}`;
    
    scheduleGrid[cellId] = { lesson, rowSpan };
    
    // Mark subsequent slots as spanned
    if (rowSpan > 1) {
      const startIndex = timeSlots.indexOf(startTimeStr);
      for (let i = 1; i < rowSpan; i++) {
        const nextSlotIndex = startIndex + i;
        if (nextSlotIndex < timeSlots.length) {
          spannedSlots.add(`${lesson.day}-${timeSlots[nextSlotIndex]}`);
        }
      }
    }
  });

  return { scheduleGrid, spannedSlots };
};
