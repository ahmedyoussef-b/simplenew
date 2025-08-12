import { z } from 'zod';
import { Role } from '@prisma/client';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export const registerSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address.' }),
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
    role: z.enum([Role.TEACHER, Role.PARENT]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export const verify2FASchema = z.object({
  code: z.string().length(6, { message: 'Code must be 6 digits.' }),
});

// Re-exporting other schemas that might exist
export const gradeSchema = z.object({});
export const subjectSchema = z.object({});
export const classSchema = z.object({});
export const teacherSchema = z.object({});
export const studentSchema = z.object({});
export const examSchema = z.object({});
export const eventSchema = z.object({});
export const announcementSchema = z.object({});
export const parentSchema = z.object({});
export const lessonSchema = z.object({});
export const resultSchema = z.object({});
export const attendanceSchema = z.object({});
export const profileUpdateSchema = z.object({});
export const assignmentSchema = z.object({});
