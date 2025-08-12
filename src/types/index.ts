// src/types/index.ts

// --- ENUMS (Single Source of Truth) ---
import type {
    User as PrismaUser,
    Admin as PrismaAdmin,
    Teacher as PrismaTeacher,
    Student as PrismaStudent,
    Attendance as PrismaAttendance,
    Class as PrismaClass,
    Subject as PrismaSubject,
    Classroom as PrismaClassroom,
    Grade as PrismaGrade,
    Lesson as PrismaLesson,
    Exam as PrismaExam,
    Parent as PrismaParent,
    Assignment as PrismaAssignment,
    Announcement as PrismaAnnouncement,
    Event as PrismaEvent,
    Result as PrismaResult,
    LessonRequirement as PrismaLessonRequirement,
    SubjectRequirement as PrismaSubjectRequirement,
    TeacherConstraint as PrismaTeacherConstraint,
    TeacherAssignment as PrismaTeacherAssignment,
    ClassAssignment as PrismaClassAssignment,
    ChatroomSession as PrismaChatroomSession,
    ScheduleDraft as PrismaScheduleDraft,
    School as PrismaSchool,
    Role,
    UserSex,
} from "@prisma/client";
import { z } from "zod";
import { loginSchema, announcementSchema, assignmentSchema, attendanceSchema, classSchema, eventSchema, examSchema, gradeSchema, lessonSchema, parentSchema, profileUpdateSchema, resultSchema, studentSchema, subjectSchema, teacherSchema } from "@/lib/formValidationSchemas";
import type { Dispatch, SetStateAction } from "react";
import { FieldErrors, SubmitHandler, UseFormHandleSubmit, UseFormRegister, UseFormSetValue } from "react-hook-form";import { type FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from "@reduxjs/toolkit";


export { Role, UserSex, Day, TimePreference } from '@prisma/client';

export type EntityType = 'grade' | 'subject' | 'class' | 'teacher' | 'student' | 'parent' | 'lesson' | 'exam' | 'assignment' | 'event' | 'announcement' | 'result' | 'attendance' | 'quiz';

// --- BASE PRISMA TYPES (Re-exported for consistency) ---
export type User = PrismaUser;
export type Admin = PrismaAdmin;
export type Teacher = PrismaTeacher;
export type Student = PrismaStudent;
export type Attendance = PrismaAttendance;
export type Class = PrismaClass;
export type Subject = PrismaSubject;
export type Classroom = PrismaClassroom;
export type Grade = PrismaGrade;
// --- MODIFIED LESSON TYPE FOR REDUX SERIALIZATION ---
export type Lesson = Omit<PrismaLesson, 'startTime' | 'endTime' | 'createdAt' | 'updatedAt'> & {
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
};
export type Exam = PrismaExam;
export type Parent = Omit<PrismaParent, 'userId'> & { userId: string | null }; // Added userId to allow null during creation
export type Assignment = PrismaAssignment;
export type Announcement = PrismaAnnouncement;
export type Event = PrismaEvent;
export type Result = PrismaResult;
export type LessonRequirement = Omit<PrismaLessonRequirement, 'id' | 'scheduleDraftId'> & { id?: number; scheduleDraftId: string | null };
export type SubjectRequirement = Omit<PrismaSubjectRequirement, 'allowedRoomIds' | 'scheduleDraftId'> & { allowedRoomIds: number[], scheduleDraftId: string | null };
export type TeacherConstraint = PrismaTeacherConstraint;
export type ClassAssignment = PrismaClassAssignment;
export type TeacherAssignment = Omit<PrismaTeacherAssignment, 'classAssignments'> & {
    classAssignments: ClassAssignment[];
};

export type ChatroomSession = PrismaChatroomSession;
export type ScheduleDraft = Omit<PrismaScheduleDraft, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
    description: string;
};
export type SchoolData = Omit<PrismaSchool, 'id'> & {
    id?: number | string,
    scheduleDraftId: string | null;
    schoolConfig: {};
    startTime: string;
    endTime?: string;
    schedule?: Lesson[];
    schoolDays?: string[];
    sessionDuration?: number;
    sessionInterval?: number;
};

// --- SAFE CLIENT-SIDE TYPES (Passwords and sensitive data omitted) ---
export type SafeUser = Omit<PrismaUser, 'password' | 'passwordResetToken' | 'passwordResetExpires' | 'twoFactorCode' | 'twoFactorCodeExpires'>;
export type SafeAdmin = PrismaAdmin & { user: SafeUser };
export type SafeTeacher = PrismaTeacher & { user: SafeUser };
export type SafeStudent = PrismaStudent & { user: SafeUser };
export type SafeParent = PrismaParent & { user: SafeUser };


// --- EXTENDED TYPES WITH RELATIONS (for complex queries) ---

export type TeacherWithDetails = Omit<PrismaTeacher, 'user'> & {
    user: SafeUser | null;
    subjects: PrismaSubject[];
    supervisedClasses: PrismaClass[];
    _count: {
        subjects: number;
        supervisedClasses: number;
    };
};

export type StudentWithDetails = PrismaStudent & {
  user: SafeUser | null;
  class: (PrismaClass & {
    _count: {
      lessons: number 
    };
    grade: PrismaGrade;
  }) | null;
  parent: PrismaParent | null;
  grade: PrismaGrade | null;
};

export type StudentWithClassAndUser = PrismaStudent & {
  class: Pick<PrismaClass, 'id' | 'name'> | null;
  user: Pick<SafeUser, 'id' | 'username' | 'email' | 'img'> | null;
};

export type ParentWithDetails = PrismaParent & {
  user: SafeUser | null;
  students: (PrismaStudent & {
    user: SafeUser | null;
    class: (PrismaClass & {
      grade: PrismaGrade;
    }) | null;
  })[];
};

export type LessonWithDetails = Lesson & {
  subject: PrismaSubject;
  class: PrismaClass;
  teacher: PrismaTeacher & {
      user: SafeUser | null;
  };
  exams: PrismaExam[];
  assignments: Assignment[];
};

export type EventWithClass = PrismaEvent & {
  class: { name: string } | null;
};

export type AnnouncementWithClass = PrismaAnnouncement & {
  class: { name: string } | null;
};

export type ClassWithGrade = Omit<PrismaClass, 'superviseurId'> & {
  grade: PrismaGrade;
  _count: {
    students: number;
    lessons: number;
  };
  supervisor: PrismaTeacher | null;
};

export type ClassWithDetails = PrismaClass & {
  grade: PrismaGrade;
  supervisor: PrismaTeacher | null;
  students: (PrismaStudent & {
    user: SafeUser | null;
  })[];
  _count: {
    students: number;
    lessons: number;
  };
};

// --- WIZARD & SCHEDULER TYPES ---

export interface WizardData {
  scheduleDraftId: null;
  school: SchoolData;
  classes: ClassWithGrade[];
  subjects: Subject[];
  teachers: TeacherWithDetails[];
  rooms: Classroom[];
  grades: Grade[];
  lessonRequirements: LessonRequirement[];
  teacherConstraints: (TeacherConstraint & { scheduleDraftId: string | null })[];
  subjectRequirements: SubjectRequirement[];
  teacherAssignments: TeacherAssignment[];
  schedule: Lesson[];
}

export interface ValidationResult {
    type: 'success' | 'warning' | 'error';
    message: string;
    details?: string;
}

// --- AUTHENTICATION & JWT TYPES ---

export interface AuthResponse {
  user: SafeUser;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  role: Role;
  name?: string;
}

export type LoginSchema = z.infer<typeof loginSchema>;

export type RegisterSchema = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string
  role: 'TEACHER' | 'PARENT';
};

export type ForgotPasswordSchema = {
  email: string;
};

export type ResetPasswordSchema = {
  password: string;
  confirmPassword: string;
};

export type Verify2FASchema = {
  code: string;
};

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}


// --- ZOD SCHEMAS AS TYPES ---
export type GradeSchema = z.infer<typeof gradeSchema>;
export type SubjectSchema = z.infer<typeof subjectSchema>;
export type ClassSchema = z.infer<typeof classSchema>;
export type TeacherSchema = z.infer<typeof teacherSchema>;
export type StudentSchema = z.infer<typeof studentSchema>;
export type ExamSchema = z.infer<typeof examSchema>;
export type EventSchema = z.infer<typeof eventSchema>;
export type AnnouncementSchema = z.infer<typeof announcementSchema>;
export type ParentSchema = z.infer<typeof parentSchema>;
export type LessonSchema = z.infer<typeof lessonSchema>;
export type ResultSchema = z.infer<typeof resultSchema>;
export type AttendanceSchema = z.infer<typeof attendanceSchema>;
export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;
export type AssignmentSchema = z.infer<typeof assignmentSchema>;


// --- FORM PROPS ---
export interface TeacherFormProps {
  type: 'create' | 'update';
  initialData?: (Partial<Teacher> & { user?: Partial<Pick<any, 'username' | 'email'>>, subjects?: Partial<Pick<Subject, 'id' | 'name'>>[] }) | null;
  setOpen: Dispatch<SetStateAction<boolean>>;
  availableSubjects?: Subject[];
  allClasses?: any[];
}

export interface StudentFormProps {
  type: "create" | "update";
  data?: Student;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { 
    grades: RelatedGrade[];
    classes: RelatedClass[];
    parents: RelatedParent[];
  };
}

export interface ParentFormProps {
  type: 'create' | 'update';
  initialData?: (Partial<Parent> & { user?: Partial<Pick<User, 'username' | 'email'>> | null }) | null;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

// --- Cloudinary Types for Upload Widgets ---
export interface CloudinaryUploadWidgetInfo {
  secure_url: string;
  resource_type: string;
  original_filename?: string;
}

export interface CloudinaryUploadWidgetResults {
  event: "success" | string;
  info: CloudinaryUploadWidgetInfo | string | { public_id: string };
}

// --- Specific Form Return Types ---
export interface TeacherFormReturn {
  register: UseFormRegister<TeacherSchema>;
  handleSubmit: UseFormHandleSubmit<TeacherSchema>;
  actualOnSubmit: SubmitHandler<TeacherSchema>;
  errors: FieldErrors<TeacherSchema>;
  isLoading: boolean;
  setValue: UseFormSetValue<TeacherSchema>;
  sexWatch: UserSex | null | undefined;
  birthdayWatch: Date | null | undefined; // Changed from string to Date
  imgPreview: string | null | undefined;
  createErrorData: FetchBaseQueryError | SerializedError | undefined;
  updateErrorData: FetchBaseQueryError | SerializedError | undefined;
}

// --- Other Utility Types ---
export type RelatedGrade = Pick<Grade, 'id' | 'level'>;
export type RelatedClass = Pick<Class, 'id' | 'name' | 'capacity'> & { _count: { students: number } };
export type RelatedParent = Pick<Parent, 'id' | 'name' | 'surname'>;


export const subjectColors = ['bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100', 'bg-red-100', 'bg-gray-100'];

// Explicitly define JsonValue if not globally available, for prisma schema relations
export type JsonValue = string | number | boolean | JsonObject | JsonArray | null;
export type JsonObject = { [Key in string]?: JsonValue };
export type JsonArray = JsonValue[];

export interface SessionTemplatePoll {
  question: string;
  options: string[];
  correctAnswer?: string; // Optional, for quiz-like polls
  duration?: number; // Optional, in seconds
}

// Example of a SessionTemplate with polls and quizzes
export interface SessionTemplate {
  id: string;
  name: string;
  description?: string;
  polls?: SessionTemplatePoll[];
  quizzes?: SessionTemplateQuiz[];
  // Other template properties
}

export interface SessionTemplateQuiz {
  question: string;
  options: string[];
  correctAnswer: string; // Quizzes require a correct answer
  duration: number; // Quizzes usually have a time limit
}

export interface ActivePoll extends SessionTemplatePoll {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date; // Will be set when the poll ends
  results?: { option: string; count: number }[];
  userVotes?: { userId: string; option: string }[];
}

export interface ActiveQuiz extends SessionTemplateQuiz {
  id: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date; // Will be set when the quiz ends
  userAnswers?: { userId: string; answer: string; isCorrect: boolean }[];
}
