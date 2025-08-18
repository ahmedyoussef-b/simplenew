/*
  Warnings:

  - You are about to drop the column `description` on the `ChatroomSession` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `answeredAt` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `QuizAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `schoolId` on the `ScheduleDraft` table. All the data in the column will be lost.
  - The primary key for the `TeacherConstraint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `optionId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `_TeacherSubjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `announcements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `class_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classrooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teacher_assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teachers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[classId,subjectId,scheduleDraftId]` on the table `LessonRequirement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `selectedOption` to the `QuizAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `QuizAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pollOptionId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomMessage" DROP CONSTRAINT "ChatroomMessage_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ChatroomSession" DROP CONSTRAINT "ChatroomSession_hostId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonRequirement" DROP CONSTRAINT "LessonRequirement_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Poll" DROP CONSTRAINT "Poll_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Quiz" DROP CONSTRAINT "Quiz_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizAnswer" DROP CONSTRAINT "QuizAnswer_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduleDraft" DROP CONSTRAINT "ScheduleDraft_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduleDraft" DROP CONSTRAINT "ScheduleDraft_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_chatroomSessionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SessionParticipant" DROP CONSTRAINT "SessionParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectRequirement" DROP CONSTRAINT "SubjectRequirement_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherConstraint" DROP CONSTRAINT "TeacherConstraint_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Vote" DROP CONSTRAINT "Vote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TeacherSubjects" DROP CONSTRAINT "_TeacherSubjects_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."admins" DROP CONSTRAINT "admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."announcements" DROP CONSTRAINT "announcements_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."assignments" DROP CONSTRAINT "assignments_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."attendances" DROP CONSTRAINT "attendances_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_assignments" DROP CONSTRAINT "class_assignments_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."class_assignments" DROP CONSTRAINT "class_assignments_teacherAssignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."classes" DROP CONSTRAINT "classes_superviseurId_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."exams" DROP CONSTRAINT "exams_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_classroomId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."lessons" DROP CONSTRAINT "lessons_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."parents" DROP CONSTRAINT "parents_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."results" DROP CONSTRAINT "results_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."students" DROP CONSTRAINT "students_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_scheduleDraftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teacher_assignments" DROP CONSTRAINT "teacher_assignments_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."teachers" DROP CONSTRAINT "teachers_userId_fkey";

-- DropIndex
DROP INDEX "public"."LessonRequirement_scheduleDraftId_classId_subjectId_key";

-- AlterTable
ALTER TABLE "public"."ChatroomSession" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "public"."LessonRequirement" ALTER COLUMN "scheduleDraftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Poll" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Quiz" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "public"."QuizAnswer" DROP COLUMN "answer",
DROP COLUMN "answeredAt",
DROP COLUMN "studentId",
ADD COLUMN     "selectedOption" INTEGER NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."QuizQuestion" ALTER COLUMN "timeLimit" SET DEFAULT 30;

-- AlterTable
ALTER TABLE "public"."ScheduleDraft" DROP COLUMN "schoolId",
ALTER COLUMN "schoolConfig" DROP NOT NULL,
ALTER COLUMN "classes" DROP NOT NULL,
ALTER COLUMN "subjects" DROP NOT NULL,
ALTER COLUMN "teachers" DROP NOT NULL,
ALTER COLUMN "classrooms" DROP NOT NULL,
ALTER COLUMN "grades" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SessionParticipant" ADD COLUMN     "leftAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."SubjectRequirement" ALTER COLUMN "timePreference" DROP DEFAULT,
ALTER COLUMN "scheduleDraftId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeacherConstraint" DROP CONSTRAINT "TeacherConstraint_pkey",
ALTER COLUMN "scheduleDraftId" DROP NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TeacherConstraint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TeacherConstraint_id_seq";

-- AlterTable
ALTER TABLE "public"."Vote" DROP COLUMN "optionId",
ADD COLUMN     "pollOptionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_TeacherSubjects";

-- DropTable
DROP TABLE "public"."admins";

-- DropTable
DROP TABLE "public"."announcements";

-- DropTable
DROP TABLE "public"."assignments";

-- DropTable
DROP TABLE "public"."attendances";

-- DropTable
DROP TABLE "public"."class_assignments";

-- DropTable
DROP TABLE "public"."classes";

-- DropTable
DROP TABLE "public"."classrooms";

-- DropTable
DROP TABLE "public"."events";

-- DropTable
DROP TABLE "public"."exams";

-- DropTable
DROP TABLE "public"."grades";

-- DropTable
DROP TABLE "public"."lessons";

-- DropTable
DROP TABLE "public"."parents";

-- DropTable
DROP TABLE "public"."results";

-- DropTable
DROP TABLE "public"."students";

-- DropTable
DROP TABLE "public"."subjects";

-- DropTable
DROP TABLE "public"."teacher_assignments";

-- DropTable
DROP TABLE "public"."teachers";

-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "img" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "twoFactorEnabled" BOOLEAN DEFAULT false,
    "twoFactorCode" TEXT,
    "twoFactorCodeExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "img" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "img" TEXT,
    "birthday" TIMESTAMP(3),
    "sex" "public"."UserSex",
    "bloodType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "birthday" TIMESTAMP(3) NOT NULL,
    "sex" "public"."UserSex" NOT NULL,
    "bloodType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gradeId" INTEGER,
    "classId" INTEGER,
    "parentId" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Parent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "img" TEXT,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Grade" (
    "id" SERIAL NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "capacity" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "supervisorId" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "weeklyHours" INTEGER,
    "coefficient" INTEGER,
    "requiresRoom" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OptionalSubject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gradeId" INTEGER NOT NULL,

    CONSTRAINT "OptionalSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Classroom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "capacity" INTEGER NOT NULL,
    "building" TEXT,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "day" "public"."Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subjectId" INTEGER,
    "optionalSubjectId" INTEGER,
    "classId" INTEGER,
    "teacherId" TEXT,
    "classroomId" INTEGER,
    "scheduleDraftId" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attendance" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "present" BOOLEAN NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assignment" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" SERIAL NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "studentId" TEXT NOT NULL,
    "examId" INTEGER,
    "assignmentId" INTEGER,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherAssignment" (
    "id" SERIAL NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "scheduleDraftId" TEXT,

    CONSTRAINT "TeacherAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClassAssignment" (
    "id" SERIAL NOT NULL,
    "teacherAssignmentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "ClassAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_SubjectToTeacher" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectToTeacher_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_StudentOptionalSubjects" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentOptionalSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "public"."User"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_userId_key" ON "public"."Admin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "public"."Teacher"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "public"."Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_userId_key" ON "public"."Parent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_level_key" ON "public"."Grade"("level");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "public"."Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_key" ON "public"."Subject"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_name_key" ON "public"."Classroom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAssignment_teacherId_subjectId_scheduleDraftId_key" ON "public"."TeacherAssignment"("teacherId", "subjectId", "scheduleDraftId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAssignment_teacherAssignmentId_classId_key" ON "public"."ClassAssignment"("teacherAssignmentId", "classId");

-- CreateIndex
CREATE INDEX "_SubjectToTeacher_B_index" ON "public"."_SubjectToTeacher"("B");

-- CreateIndex
CREATE INDEX "_StudentOptionalSubjects_B_index" ON "public"."_StudentOptionalSubjects"("B");

-- CreateIndex
CREATE UNIQUE INDEX "LessonRequirement_classId_subjectId_scheduleDraftId_key" ON "public"."LessonRequirement"("classId", "subjectId", "scheduleDraftId");

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Parent" ADD CONSTRAINT "Parent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OptionalSubject" ADD CONSTRAINT "OptionalSubject_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "public"."Grade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_optionalSubjectId_fkey" FOREIGN KEY ("optionalSubjectId") REFERENCES "public"."OptionalSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "public"."Classroom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."Assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonRequirement" ADD CONSTRAINT "LessonRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherConstraint" ADD CONSTRAINT "TeacherConstraint_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectRequirement" ADD CONSTRAINT "SubjectRequirement_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAssignment" ADD CONSTRAINT "TeacherAssignment_scheduleDraftId_fkey" FOREIGN KEY ("scheduleDraftId") REFERENCES "public"."ScheduleDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAssignment" ADD CONSTRAINT "ClassAssignment_teacherAssignmentId_fkey" FOREIGN KEY ("teacherAssignmentId") REFERENCES "public"."TeacherAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAssignment" ADD CONSTRAINT "ClassAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomSession" ADD CONSTRAINT "ChatroomSession_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionParticipant" ADD CONSTRAINT "SessionParticipant_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomMessage" ADD CONSTRAINT "ChatroomMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatroomMessage" ADD CONSTRAINT "ChatroomMessage_chatroomSessionId_fkey" FOREIGN KEY ("chatroomSessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Poll" ADD CONSTRAINT "Poll_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Vote" ADD CONSTRAINT "Vote_pollOptionId_fkey" FOREIGN KEY ("pollOptionId") REFERENCES "public"."PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."ChatroomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAnswer" ADD CONSTRAINT "QuizAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubjectToTeacher" ADD CONSTRAINT "_SubjectToTeacher_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" ADD CONSTRAINT "_StudentOptionalSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."OptionalSubject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_StudentOptionalSubjects" ADD CONSTRAINT "_StudentOptionalSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
