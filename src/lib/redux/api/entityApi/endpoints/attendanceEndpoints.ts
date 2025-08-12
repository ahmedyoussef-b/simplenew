
import { Attendance, AttendanceSchema } from '@/types/index';
import { generateEndpoint } from '../utils';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

export const attendanceEndpoints = (builder: EndpointBuilder<any, any, any>) => {
  const { get, create, update, remove } = generateEndpoint<
    Attendance,
    AttendanceSchema,
    AttendanceSchema & { id: number }
  >('attendance');

  return {
    getAttendances: builder.query(get),
    createAttendance: builder.mutation(create),
    updateAttendance: builder.mutation(update),
    deleteAttendance: builder.mutation(remove),
  };
};
