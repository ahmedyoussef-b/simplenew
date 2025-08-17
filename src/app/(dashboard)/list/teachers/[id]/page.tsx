// src/app/(dashboard)/list/teachers/[id]/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { type TeacherWithDetails } from "@/types/index";
import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { Skeleton } from "@/components/ui/skeleton";
import TeacherProfileCard from "@/components/teacher/TeacherProfileCard";
import TeacherStatsCards from "@/components/teacher/TeacherStatsCards";
import TeacherShortcuts from "@/components/teacher/TeacherShortcuts";
import { fetchAllDataForWizard } from '@/lib/data-fetching/fetch-wizard-data';

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
      </div>
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <TeacherShortcuts teacherId={teacher.id}  />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
