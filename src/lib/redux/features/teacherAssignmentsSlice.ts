// src/lib/redux/features/teacherAssignmentsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { TeacherAssignment } from '@/types/index'; // Import from the central types file

export type TeacherAssignmentsState = {
  items: TeacherAssignment[];
};

const initialState: TeacherAssignmentsState = {
  items: [],
};

export const teacherAssignmentsSlice = createSlice({
  name: 'teacherAssignments',
  initialState,
  reducers: {
    setAllTeacherAssignments(state, action: PayloadAction<TeacherAssignment[]>) {
      state.items = action.payload;
    },
    setAssignment(state, action: PayloadAction<{ teacherId: string; subjectId: number; classIds: number[] }>) {
        const { teacherId, subjectId, classIds } = action.payload;
        const existingAssignmentIndex = state.items.findIndex(
            (a) => a.teacherId === teacherId && a.subjectId === subjectId
        );

        // Remove any existing assignments of these classes to other teachers for the same subject
        state.items.forEach(assignment => {
            if (assignment.subjectId === subjectId && assignment.teacherId !== teacherId) {
                assignment.classIds = assignment.classIds.filter(id => !classIds.includes(id));
            }
        });

        if (existingAssignmentIndex > -1) {
            if (classIds.length > 0) {
                state.items[existingAssignmentIndex].classIds = classIds;
            } else {
                // If the class list is empty, remove the assignment
                state.items.splice(existingAssignmentIndex, 1);
            }
        } else if (classIds.length > 0) {
            // Create a new assignment if it doesn't exist and there are classes to assign
            state.items.push({
                id: -Date.now(),
                teacherId,
                subjectId,
                classIds,
                scheduleDraftId: null,
                classAssignments: []
            });
        }
        
        // Clean up any assignments that are now empty
        state.items = state.items.filter(a => a.classIds.length > 0);
    },
    toggleClassAssignment(state, action: PayloadAction<{ teacherId: string, subjectId: number, classId: number }>) {
        const { teacherId, subjectId, classId } = action.payload;

        // First, check if this class is assigned to ANY teacher for this subject and remove it
        state.items.forEach(assignment => {
            if (assignment.subjectId === subjectId) {
                const classIndex = assignment.classIds.indexOf(classId);
                if (classIndex > -1) {
                    // If it was assigned to the current teacher, this means we are toggling it OFF.
                    // If it was assigned to another teacher, this logic still holds: it becomes free.
                    assignment.classIds.splice(classIndex, 1);
                }
            }
        });

        // Clean up any assignments that are now empty
        state.items = state.items.filter(a => a.classIds.length > 0);

        // Find the specific assignment for the toggling teacher
        const targetAssignment = state.items.find(
            a => a.teacherId === teacherId && a.subjectId === subjectId
        );
        
        const isCurrentlyAssigned = targetAssignment?.classIds.includes(classId);

        if (!isCurrentlyAssigned) {
            // If it's not currently assigned to our target teacher, we assign it (toggle ON).
            if (targetAssignment) {
                targetAssignment.classIds.push(classId);
            } else {
                // Or create a new assignment if one doesn't exist for this teacher/subject combo
                state.items.push({
                    id: -Date.now(),
                    teacherId,
                    subjectId,
                    classIds: [classId],
                    scheduleDraftId: null,
                    classAssignments: []
                });
            }
        }
    },
    clearAllAssignments(state) {
        state.items = [];
    },
    removeAssignmentsForTeacher(state, action: PayloadAction<string>) {
      const teacherId = action.payload;
      state.items = state.items.filter(a => a.teacherId !== teacherId);
    },
  },
  selectors: {
    selectTeacherAssignments: (state) => state.items,
  }
});

export const { setAllTeacherAssignments, toggleClassAssignment, clearAllAssignments, removeAssignmentsForTeacher, setAssignment } = teacherAssignmentsSlice.actions;
export const { selectTeacherAssignments } = teacherAssignmentsSlice.selectors;
export default teacherAssignmentsSlice.reducer;
