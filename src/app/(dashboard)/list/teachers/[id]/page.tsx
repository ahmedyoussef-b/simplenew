// src/app/(dashboard)/list/teachers/[id]/page.tsx
import Announcements from "@/components/Announcements";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { type TeacherWithDetails, type WizardData, type ClassWithGrade, type Subject, type Classroom, type Lesson } from "@/types/index";
import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import TeacherProfileCard from "@/components/teacher/TeacherProfileCard";
import TeacherStatsCards from "@/components/teacher/TeacherStatsCards";
import TeacherShortcuts from "@/components/teacher/TeacherShortcuts";

const TimetableDisplay = dynamic(() => import('@/components/schedule/TimetableDisplay'), {
  ssr: false,
  loading: () => <Skeleton className="h-[700px] w-full" />,
});

const SingleTeacherPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const id = params.id;

  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;

  if (!session) redirect(`/login`);

  // Allow admins and any teacher to view this page.
  // Redirect other roles to their respective dashboards.
  if (userRole !== Role.ADMIN && userRole !== Role.TEACHER) {
    redirect(`/${userRole?.toLowerCase() || 'login'}`);
  }

  const teacherFromDb = await prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        subjects: true,
      },
  });

  if (!teacherFromDb) {
    return notFound();
  }
  
  // --- REFACTORED DATA FETCHING ---
  const lessons = await prisma.lesson.findMany({
    where: { teacherId: id },
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
      scheduleDraftId: true, // Add this line
      subject: { select: { name: true } },
      class: { select: { name: true } },
      createdAt: true, // Add createdAt
      updatedAt: true, // Add updatedAt
    },
  });
  
  const classIds = [...new Set(lessons.map(l => l.classId).filter(id => id !== null))];

  const teacher: TeacherWithDetails = {
    ...teacherFromDb,
    classes: [], // Classes data is not directly needed here, count is derived from lessons
    _count: {
      subjects: teacherFromDb.subjects.length,
      classes: classIds.length,
    }
  }

  const teacherClasses = await prisma.class.findMany({
    where: { id: { in: classIds as number[] } },
    include: { grade: true },
  }) as unknown as ClassWithGrade[];

  const [allSubjects, allClassrooms] = await Promise.all([
    prisma.subject.findMany(),
    prisma.classroom.findMany(),
  ]);

  const wizardData: WizardData = {
    school: {
      name: `Emploi du temps de ${teacher.name} ${teacher.surname}`,
      startTime: '08:00',
      endTime: '18:00',
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      sessionDuration: 60,
      scheduleDraftId: null, // Add missing property
      schoolConfig: {}, // Add missing property
    },
    classes: teacherClasses,
    subjects: allSubjects as Subject[],
    teachers: [teacher] as TeacherWithDetails[], // Only this teacher
    rooms: allClassrooms as Classroom[],
    grades: [],
    lessonRequirements: [],
    teacherConstraints: [],
    subjectRequirements: [],
    teacherAssignments: [],
    scheduleDraftId: null,
    schedule: []
  };
  // --- END REFACTORED DATA FETCHING ---

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <TeacherProfileCard teacher={teacher as TeacherWithDetails} userRole={userRole} />
          <TeacherStatsCards stats={teacher._count} />
        </div>
        <div className="mt-4 bg-white rounded-md p-4 h-auto">
          <h1 className="text-xl font-semibold mb-4">{`Horaire de ${teacher.name} ${teacher.surname}`}</h1>
          <TimetableDisplay wizardData={wizardData} viewMode="teacher" selectedViewId={id} />
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <TeacherShortcuts teacherId={teacher.id}  />
        <Performance title="Performance" />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
