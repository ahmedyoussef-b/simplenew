// src/components/forms/StudentForm/types.ts
// This file is obsolete. All types have been centralized in src/types/index.ts
// to prevent circular dependencies and improve maintainability.
// This file can be deleted.

import type { Student, User } from '@/types';

// This is the type for the data prop when updating a student.
// It includes the student's own data and relevant fields from the associated user.
export type UpdateStudentData = Partial<Student> & {
    username?: string;
    email?: string;
};
