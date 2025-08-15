// src/lib/redux/features/classrooms/classroomsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Classroom } from '@/types';
import { entityApi } from '../../api/entityApi';

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
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      entityApi.endpoints.getRooms.matchFulfilled, // Assuming you add getRooms endpoint
      (state, { payload }) => {
        state.items = payload as Classroom[];
        state.status = 'succeeded';
      }
    )
  },
  selectors: {
    selectAllSalles: (state) => state.items,
    getSallesStatus: (state) => state.status,
    getSallesError: (state) => state.error,
  }
});

export const { setAllClassrooms } = classroomsSlice.actions;
export const { selectAllSalles, getSallesStatus, getSallesError } = classroomsSlice.selectors;
export default classroomsSlice.reducer;
