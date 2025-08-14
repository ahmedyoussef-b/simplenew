
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

  if (userRole !== Role.ADMIN && userRole !== Role.TEACHER && session?.user.id !== id) {
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
  
  const lessons = await prisma.lesson.findMany({
    where: { teacherId: id },
    select: {
      id: true, name: true, day: true, startTime: true, endTime: true,
      subjectId: true, classId: true, teacherId: true, classroomId: true,
      scheduleDraftId: true, subject: { select: { name: true } },
      class: { select: { name: true } }, createdAt: true, updatedAt: true,
    },
  });
  
  const classIds = [...new Set(lessons.map(l => l.classId).filter(id => id !== null))];

  const teacherClasses = await prisma.class.findMany({
    where: { id: { in: classIds as number[] } },
    include: { grade: true },
  }) as unknown as ClassWithGrade[];

  const [allSubjects, allClassrooms, allTeachersFromDb] = await Promise.all([
    prisma.subject.findMany(),
    prisma.classroom.findMany(),
    prisma.teacher.findMany({ 
        include: { 
            user: true, 
            subjects: true, 
            lessons: { select: { classId: true }, distinct: ['classId'] }
        }
    }),
  ]);

  const allTeachers: TeacherWithDetails[] = allTeachersFromDb.map(t => ({
    ...t,
    classes: [],
    _count: {
      subjects: t.subjects.length,
      classes: new Set(t.lessons.map(l => l.classId)).size
    }
  }));

  const wizardData: WizardData = {
    school: {
      name: `Emploi du temps de ${teacherFromDb.name} ${teacherFromDb.surname}`,
      startTime: '08:00', endTime: '18:00',
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      sessionDuration: 60, scheduleDraftId: null, schoolConfig: {},
    },
    classes: teacherClasses,
    subjects: allSubjects as Subject[],
    teachers: allTeachers, // Pass all teachers
    rooms: allClassrooms as Classroom[],
    grades: [], lessonRequirements: [], teacherConstraints: [],
    subjectRequirements: [], teacherAssignments: [], scheduleDraftId: null,
    schedule: []
  };

  const teacher: TeacherWithDetails = {
    ...teacherFromDb,
    classes: [],
    _count: {
      subjects: teacherFromDb.subjects.length,
      classes: classIds.length,
    }
  }

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
