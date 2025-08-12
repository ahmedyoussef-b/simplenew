// src/lib/redux/features/teachers/teachersSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TeacherWithDetails } from '@/types'; 

export type TeachersState = {
  items: Array<TeacherWithDetails>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: TeachersState = {
  items: [],
  status: 'idle',
  error: null,
};


export const teachersSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {
    setAllTeachers(state, action: PayloadAction<any[]>) {
      state.items = action.payload.map(teacher => ({
        ...teacher,
        // Ensure birthday is always a serializable string or null
        birthday: teacher.birthday ? new Date(teacher.birthday).toISOString() : null,
      }));
      state.status = 'succeeded';
    },
    localAddTeacher(state, action: PayloadAction<TeacherWithDetails>) {
        const teacher = action.payload;
        state.items.push(teacher);
        state.items.sort((a,b) => (a.surname || '').localeCompare(b.surname || '') || (a.name || '').localeCompare(b.name || ''));
    },
    localDeleteTeacher(state, action: PayloadAction<string>) {
        state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
  selectors: {
    selectAllProfesseurs: (state) => state.items,
    getProfesseursStatus: (state) => state.status,
    getProfesseursError: (state) => state.error,
  }
});

export const { setAllTeachers, localAddTeacher, localDeleteTeacher } = teachersSlice.actions;
export const { selectAllProfesseurs, getProfesseursStatus, getProfesseursError } = teachersSlice.selectors;
export default teachersSlice.reducer;
