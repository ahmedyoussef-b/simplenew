// src/app/[locale]/(dashboard)/list/students/[id]/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import  {Role} from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import StudentWeeklyAttendanceChart from "@/components/attendance/StudentWeeklyAttendanceChart";
import StudentProfileCard from "@/components/student/StudentProfileCard";
import StudentStatsCards from "@/components/student/StudentStatsCards";
import StudentShortcuts from "@/components/student/StudentShortcuts";
import TimetableDisplay from "@/components/schedule/TimetableDisplay";
import { fetchAllDataForWizard } from "@/lib/data-fetching/fetch-wizard-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import type { StudentWithDetails, WizardData, Lesson, ClassWithGrade, TeacherWithDetails, Subject, Classroom } from "@/types/index";

const SingleStudentPage = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = params;

  const session = await getServerSession();
  const userRole = session?.user?.role as Role | undefined;
  const currentUserId = session?.user?.id;

  if (!session) redirect(`/login`);

  const student: StudentWithDetails | null =
    await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: { include: { _count: { select: { lessons: true } }, grade: true } },
        parent: true,
        grade: true,
      },
  });

  if (!student || !student.class) {
    return notFound();
  }

  let canView = false;
  if (userRole === Role.ADMIN) {
    canView = true;
  } else if (userRole === Role.TEACHER && currentUserId) {
    const teacherClasses = await prisma.class.findMany({
      where: {
        id: student.classId || undefined,
        lessons: { some: { teacherId: currentUserId } }
      },
      select: { id: true }
    });
    if (teacherClasses.length > 0) canView = true;
  } else if (userRole === Role.PARENT && currentUserId) {
    const parentProfile = await prisma.parent.findUnique({ where: { userId: currentUserId }});
    if(parentProfile && student.parentId === parentProfile.id) canView = true;
  } else if (userRole === Role.STUDENT && currentUserId) {
    if (student.userId === currentUserId) canView = true;
  }

  if (!canView) {
     redirect(`/${userRole?.toLowerCase() || 'login'}`);
  }

  // --- Fetch data for Timetable ---
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
            lessons: { select: { classId: true }, distinct: ['classId'] } 
        } 
    }),
    prisma.classroom.findMany(),
  ]);

  const allTeachers: TeacherWithDetails[] = allTeachersFromDb.map(t => ({
      ...t,
      classes: [],
      _count: {
          subjects: t.subjects.length,
          classes: new Set(t.lessons.map(l => l.classId)).size,
          lessons: t.lessons.length,
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
    schedule: lessons,
    scheduleDraftId: null
  };
  // --- End Timetable Data Fetch ---


  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row gap-4">
            <div className="w-full xl:w-2/3">
                <div className="flex flex-col lg:flex-row gap-4">
                    <StudentProfileCard student={student} userRole={userRole} />
                    <StudentStatsCards student={student} />
                </div>
            </div>
            <div className="w-full xl:w-1/3 flex flex-col gap-4">
                <StudentShortcuts student={student} />
                <Suspense fallback={<Skeleton className="h-[320px] w-full" />}>
                    <StudentWeeklyAttendanceChart studentId={student.id} />
                </Suspense>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Emploi du Temps de la Classe</CardTitle>
                <CardDescription>
                    Aperçu de l'emploi du temps hebdomadaire pour la classe {student.class.name}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TimetableDisplay 
                    wizardData={wizardData} 
                    viewMode={"class"} 
                    selectedViewId={student.classId?.toString() || ""}
                />
            </CardContent>
        </Card>
    </div>
  );
};

export default SingleStudentPage;
