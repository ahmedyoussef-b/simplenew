// src/lib/redux/features/classrooms/classroomsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Classroom } from '@/types';

export type ClassroomsState = {
  items: Array<Classroom>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ClassroomsState = {
  items: [],
  status: 'idle',
  error: null,
};

export const classroomsSlice = createSlice({
  name: 'classrooms',
  initialState,
  reducers: {
    setAllClassrooms(state, action: PayloadAction<Classroom[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    localAddClassroom(state, action: PayloadAction<Classroom>) {
      state.items.push(action.payload);
      state.items.sort((a,b) => a.name.localeCompare(b.name));
    },
    localDeleteClassroom(state, action: PayloadAction<number>) {
      state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
  selectors: {
    selectAllSalles: (state) => state.items,
    getSallesStatus: (state) => state.status,
    getSallesError: (state) => state.error,
  }
});

export const { setAllClassrooms, localAddClassroom, localDeleteClassroom } = classroomsSlice.actions;
export const { selectAllSalles, getSallesStatus, getSallesError } = classroomsSlice.selectors;
export default classroomsSlice.reducer;
