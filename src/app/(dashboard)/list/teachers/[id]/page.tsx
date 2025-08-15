// src/app/(dashboard)/list/teachers/[id]/page.tsx
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
import { fetchAllDataForWizard } from '@/lib/data-fetching/fetch-wizard-data'; // Import the new data fetching function

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
  
  // Use the centralized data fetching logic. This includes the active draft's schedule.
  const wizardData = await fetchAllDataForWizard();

  const teacher = wizardData.teachers.find(t => t.id === id);

  if (!teacher) {
    return notFound();
  }
  
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      <div className="w-full xl:w-2/3">
        <div className="flex flex-col lg:flex-row gap-4">
          <TeacherProfileCard teacher={teacher} userRole={userRole} />
          <TeacherStatsCards stats={teacher._count} />
        </div>
        <div className="mt-4 bg-white rounded-md p-4 h-auto">
          <h1 className="text-xl font-semibold mb-4">{`Horaire de ${teacher.name} ${teacher.surname}`}</h1>
          {/* TimetableDisplay will now use the schedule from the fetched WizardData (active draft) */}
          <TimetableDisplay wizardData={wizardData} viewMode="teacher" selectedViewId={id} />
        </div>
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <TeacherShortcuts teacherId={teacher.id}  />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
