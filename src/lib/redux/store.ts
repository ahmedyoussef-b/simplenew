// src/lib/redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { authApi } from './api/authApi';
import authReducer from './features/auth/authSlice';
import classesReducer from './features/classes/classesSlice';
import subjectsReducer from './features/subjects/subjectsSlice';
import teachersReducer from './features/teachers/teachersSlice';
import classroomsReducer from './features/classrooms/classroomsSlice';
import scheduleReducer from './features/schedule/scheduleSlice';
import sessionReducer from './slices/sessionSlice';
import notificationReducer from './slices/notificationSlice';
import reportReducer from './slices/reportSlice';
import lessonRequirementsReducer from './features/lessonRequirements/lessonRequirementsSlice';
import gradesReducer from './features/grades/gradesSlice';
import teacherConstraintsReducer from './features/teacherConstraintsSlice';
import subjectRequirementsReducer from './features/subjectRequirementsSlice';
import teacherAssignmentsReducer from './features/teacherAssignmentsSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import schoolConfigReducer from './features/schoolConfigSlice';
import scheduleDraftReducer from './features/scheduleDraftSlice'; 
import { entityApi } from './api/entityApi/index';
// Removed loadState and saveState imports as they are no longer used

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [entityApi.reducerPath]: entityApi.reducer,
  auth: authReducer,
  classes: classesReducer,
  subjects: subjectsReducer,
  teachers: teachersReducer,
  classrooms: classroomsReducer,
  schedule: scheduleReducer,
  session: sessionReducer,
  notifications: notificationReducer,
  reports: reportReducer,
  lessonRequirements: lessonRequirementsReducer,
  grades: gradesReducer,
  teacherConstraints: teacherConstraintsReducer,
  subjectRequirements: subjectRequirementsReducer,
  teacherAssignments: teacherAssignmentsReducer,
  schoolConfig: schoolConfigReducer,
  attendance: attendanceReducer,
  scheduleDraft: scheduleDraftReducer, 
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat([authApi.middleware, entityApi.middleware]),
});


export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;
