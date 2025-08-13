// src/app/(dashboard)/student/page.tsx

import Announcements from "@/components/Announcements";
import { getServerSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StudentWeeklyAttendanceChart from "@/components/attendance/StudentWeeklyAttendanceChart";

import type { Lesson, WizardData, ClassWithGrade, TeacherWithDetails, Subject, Classroom } from '@/types';

const TimetableDisplay = dynamic(() => import('@/components/schedule/TimetableDisplay'), {
  ssr: false,
  loading: () => <Skeleton className="h-[700px] w-full" />,
});

const StudentPage = async () => {
  const session = await getServerSession();

  if (!session || !session.user || session.user.role !== Role.STUDENT) {
    redirect(session?.user ? `/${session.user.role.toLowerCase()}` : `/login`);
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      class: { include: { grade: true } },
    },
  });

  if (!student || !student.class) {
    // Handle the case where the student or their class is not found
    return (
      <div className="p-4 md:p-6 text-center">
        <Card className="inline-block p-8">
          <CardHeader>
            <CardTitle>Profil Étudiant Non Trouvé</CardTitle>
            <CardDescription>
              Votre profil étudiant ou les informations de votre classe n'ont pas été trouvés. Veuillez contacter l'administration.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }


  const studentClass = student.class;

  const [lessonsFromDb, allSubjects, allTeachersFromDb, allClassrooms] = await Promise.all([
    prisma.lesson.findMany({
      where: {
        classId: studentClass.id,
      },
      select: {
        id: true,
        name: true,
        day: true,
        startTime: true,
        endTime: true,
        subjectId: true,
        classId: true,
        teacherId: true,
        classroomId: true,
        scheduleDraftId: true,
        createdAt: true,
        updatedAt: true,
        subject: { select: { name: true } },
        class: { select: { name: true } },
      },
    }),
    prisma.subject.findMany(),
    prisma.teacher.findMany({ 
        include: { 
            user: true, 
            subjects: true, 
            classes: true,
        } 
    }),
    prisma.classroom.findMany(),
  ]);

  const allTeachers: TeacherWithDetails[] = allTeachersFromDb.map(t => ({
      ...t,
      _count: {
          subjects: t.subjects.length,
          classes: t.classes.length,
      }
  }));

  const lessons: Lesson[] = lessonsFromDb.map(lesson => ({
    ...lesson,
    startTime: lesson.startTime.toISOString(),
    endTime: lesson.endTime.toISOString(),
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  }));


  const wizardData: WizardData = {
    school: {
      name: `Classe ${studentClass.name}`,
      startTime: '08:00',
      endTime: '17:00',
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      sessionDuration: 60,
      scheduleDraftId: null,
      schoolConfig: {}
    },
    classes: [studentClass as unknown as ClassWithGrade],
    subjects: allSubjects as Subject[],
    teachers: allTeachers,
    rooms: allClassrooms as Classroom[],
    grades: [],
    lessonRequirements: [],
    teacherConstraints: [],
    subjectRequirements: [],
    teacherAssignments: [],
    schedule: lessons, // The actual schedule will come from lessons
    scheduleDraftId: null
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <StudentWeeklyAttendanceChart studentId={student.id} />
      </div>
      <div className="mt-4 bg-white rounded-md p-4 h-auto">
        <h1 className="text-xl font-semibold mb-4">Mon Horaire</h1>
        <TimetableDisplay wizardData={wizardData} viewMode={"class"} selectedViewId={student.classId?.toString() || ""} />
      </div>
    </div>
  );
};

export default StudentPage;
