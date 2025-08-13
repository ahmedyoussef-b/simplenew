// src/lib/redux/store.ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { authApi } from './api/authApi';
import authReducer from './slices/authSlice';
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
import scheduleDraftReducer from './features/scheduleDraftSlice'; // Ajout de l'import
import { entityApi } from './api/entityApi/index';
import { loadState, saveState } from './storage';
import { throttle } from 'lodash';

// Load the persisted state for the scheduler only
const persistedSchedulerState = loadState();

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
  scheduleDraft: scheduleDraftReducer, // Enregistrement du reducer
});

export const store = configureStore({
  preloadedState: persistedSchedulerState,
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat([authApi.middleware, entityApi.middleware]),
});


// Subscribe to store updates to save the state, only on the client side.
if (typeof window !== 'undefined') {
    store.subscribe(throttle(() => {
        const state = store.getState();
        // We only persist the configuration part of the state
        const stateToPersist = {
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
        };
        saveState(stateToPersist);
    }, 2000)); // Throttle saving to every 2 seconds
}

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = typeof store;