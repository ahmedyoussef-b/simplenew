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
import { loadState, saveState } from './storage';
import { throttle } from 'lodash';

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

const preloadedState = loadState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat([authApi.middleware, entityApi.middleware]),
});

// Save state to localStorage on every state change, throttled to once per second.
store.subscribe(throttle(() => {
  const state = store.getState();
  // Only save the scheduler-related state
  saveState({
    schoolConfig: state.schoolConfig,
    classes: state.classes,
    subjects: state.subjects,
    teachers: state.teachers,
    classrooms: state.classrooms,
    grades: state.grades,
    lessonRequirements: state.lessonRequirements,
    teacherConstraints: state.teacherConstraints,
    subjectRequirements: state.subjectRequirements,
    teacherAssignments: state.teacherAssignments,
    schedule: state.schedule,
    scheduleDraft: state.scheduleDraft
  });
}, 1000));


export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;
