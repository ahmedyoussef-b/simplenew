import { createApi } from '@reduxjs/toolkit/query/react';
import { entityConfig, baseQueryWithCredentials } from './config'; // Import baseQueryWithCredentials
import { gradeEndpoints } from './endpoints/gradeEndpoints';
import { subjectEndpoints } from './endpoints/subjectEndpoints';
import { classEndpoints } from './endpoints/classEndpoints';
import { teacherEndpoints } from './endpoints/teacherEndpoints';
import { studentEndpoints } from './endpoints/studentEndpoints';
import { parentEndpoints } from './endpoints/parentEndpoints';
import { lessonEndpoints } from './endpoints/lessonEndpoints';
import { examEndpoints } from './endpoints/examEndpoints';
import { assignmentEndpoints } from './endpoints/assignmentEndpoints';
import { eventEndpoints } from './endpoints/eventEndpoints';
import { announcementEndpoints } from './endpoints/announcementEndpoints';
import { resultEndpoints } from './endpoints/resultEndpoints';
import { attendanceEndpoints } from './endpoints/attendanceEndpoints';
import { authApi } from '../authApi'; // Import authApi to dispatch actions

export const entityApi = createApi({
  reducerPath: 'entityApi',
  baseQuery: baseQueryWithCredentials, // Use the new baseQuery
  tagTypes: Object.values(entityConfig).map(e => e.tag),
  endpoints: (builder) => ({
    ...gradeEndpoints(builder),
    ...subjectEndpoints(builder),
    ...classEndpoints(builder),
    ...teacherEndpoints(builder),
    ...studentEndpoints(builder),
    ...parentEndpoints(builder),
    ...lessonEndpoints(builder),
    ...examEndpoints(builder),
    ...assignmentEndpoints(builder),
    ...eventEndpoints(builder),
    ...announcementEndpoints(builder),
    ...resultEndpoints(builder),
    ...attendanceEndpoints(builder),

    // The updateProfile mutation is better placed here as it updates user-profile entities
    // which are managed across the app, not just auth.
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/api/profile',
        method: 'PUT',
        body,
      }),
      // This is the key fix: after the profile is updated successfully,
      // we need to force a refetch of the session data so that components
      // like the Navbar, which rely on the authApi's session data, get the new info.
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // After the mutation is successful, invalidate the session tag in the authApi
          // to force a re-fetch of the user's session data.
          dispatch(
            authApi.util.invalidateTags([{ type: 'Session', id: 'CURRENT' }])
          );
        } catch {
          // Errors are handled by the component that calls the mutation.
        }
      },
    }),
  }),
});

export const {
  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetClassesQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetParentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useGetAssignmentsQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useGetResultsQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useGetAttendancesQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useUpdateProfileMutation, // Exposing the mutation hook
} = entityApi;
