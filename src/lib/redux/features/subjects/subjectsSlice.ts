// src/lib/redux/features/subjects/subjectsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Subject } from '@/types';

export type SubjectsState = {
  items: Array<Subject>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};

const initialState: SubjectsState = {
  items: [],
  status: 'idle',
  error: null,
};


export const subjectsSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setAllSubjects(state, action: PayloadAction<Subject[]>) {
      state.items = action.payload;
      state.status = 'succeeded';
    },
    localAddSubject(state, action: PayloadAction<Subject>) {
        state.items.push(action.payload);
        state.items.sort((a,b) => a.name.localeCompare(b.name));
    },
    localDeleteSubject(state, action: PayloadAction<number>) {
        state.items = state.items.filter(s => s.id !== action.payload);
    },
    localUpdateSubject(state, action: PayloadAction<Partial<Subject> & { id: number }>) {
        const index = state.items.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload };
        }
    },
  },
  selectors: {
    selectAllMatieres: (state) => state.items,
    getMatieresStatus: (state) => state.status,
    getMatieresError: (state) => state.error,
  }
});

export const { setAllSubjects, localAddSubject, localDeleteSubject, localUpdateSubject } = subjectsSlice.actions;
export const { selectAllMatieres, getMatieresStatus, getMatieresError } = subjectsSlice.selectors;
export default subjectsSlice.reducer;
