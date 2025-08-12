// src/lib/redux/features/classes/classesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ClassWithGrade } from '@/types';

export type ClassesState = {
  items: Array<ClassWithGrade>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: ClassesState = {
  items: [],
  status: 'idle',
  error: null,
};


export const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    // --- Local Reducers for Draft Mode ---
    setAllClasses(state, action: PayloadAction<ClassWithGrade[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    localAddClass(state, action: PayloadAction<ClassWithGrade>) {
        state.items.push(action.payload);
        state.items.sort((a,b) => a.name.localeCompare(b.name));
    },
    localDeleteClass(state, action: PayloadAction<number>) {
        state.items = state.items.filter(c => c.id !== action.payload);
    },
  },
  selectors: {
    selectAllClasses: (state) => state.items,
    getClassesStatus: (state) => state.status,
    getClassesError: (state) => state.error,
  }
});

export const { setAllClasses, localAddClass, localDeleteClass } = classesSlice.actions;
export const { selectAllClasses, getClassesStatus, getClassesError } = classesSlice.selectors;
export default classesSlice.reducer;
