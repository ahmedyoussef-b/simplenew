// src/app/[locale]/(dashboard)/list/students/[id]/page.tsx
import Announcements from "@/components/Announcements";
import { getServerSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { type StudentWithDetails } from "@/types/index";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import  {Role} from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import StudentWeeklyAttendanceChart from "@/components/attendance/StudentWeeklyAttendanceChart";
import StudentProfileCard from "@/components/student/StudentProfileCard";
import StudentStatsCards from "@/components/student/StudentStatsCards";
import StudentShortcuts from "@/components/student/StudentShortcuts";

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

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
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
  );
};

export default SingleStudentPage;
