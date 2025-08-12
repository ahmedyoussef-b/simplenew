// src/components/teacher/TeacherStatsCards.tsx
import Image from "next/image";
import * as paths from "@/lib/image-paths";

interface TeacherStatsCardsProps {
  stats: {
    subjects: number;
  };
}

export default function TeacherStatsCards({ stats }: TeacherStatsCardsProps) {
  return (
    <div className="flex-1 flex gap-4 justify-between flex-wrap">
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <Image
          src={paths.singleBranchIcon}
          alt="matières"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <div>
          <h1 className="text-xl font-semibold">
            {stats.subjects}
          </h1>
          <span className="text-sm text-gray-400">Matières Enseignées</span>
        </div>
      </div>
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <Image
          src={paths.singleLessonIcon}
          alt="cours"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <div>
          <h1 className="text-xl font-semibold">
            N/A
          </h1>
          <span className="text-sm text-gray-400">Cours Donnés</span>
        </div>
      </div>
      <div className="bg-card p-4 rounded-lg flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%] shadow-md hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-muted/50">
        <Image
          src={paths.singleAttendanceIcon}
          alt="présence"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <div>
          <h1 className="text-xl font-semibold">N/A</h1>
          <span className="text-sm text-gray-400">Présence (N/A)</span>
        </div>
      </div>
    </div>
  );
}
