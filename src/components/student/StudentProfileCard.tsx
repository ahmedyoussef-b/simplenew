// src/components/student/StudentProfileCard.tsx
import FormContainer from "@/components/FormContainer";
import DynamicAvatar from "@/components/DynamicAvatar";
import { Role } from "@prisma/client";
import type { StudentWithDetails } from "@/types/index";
import { Droplets, Calendar as CalendarIcon, Mail, Phone } from 'lucide-react';

interface StudentProfileCardProps {
  student: StudentWithDetails;
  userRole?: Role;
}

export default function StudentProfileCard({ student, userRole }: StudentProfileCardProps) {
  return (
    <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
      <div className="w-1/3 flex items-center justify-center">
        <div className="relative w-36 h-36 flex items-center justify-center overflow-hidden rounded-full bg-muted">
          <DynamicAvatar
            imageUrl={student.user?.img || student.img}
            seed={student.id || student.user?.email || Math.random().toString(36).substring(7)}
            isLCP={true}
          />
        </div>
      </div>
      <div className="w-2/3 flex flex-col justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">
            {student.name} {student.surname}
          </h1>
          {userRole === Role.ADMIN && (
            <FormContainer
              table="student"
              type="update"
              data={{
                ...student,
                username: student.user?.username,
                email: student.user?.email,
                birthday: student.birthday ? new Date(student.birthday) : undefined,
              }}
            />
          )}
        </div>
        <p className="text-sm text-gray-500">
          Étudiant à Riadh5College, apprenant enthousiaste.
        </p>
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
          <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5" />
            <span>{student.bloodType}</span>
          </div>
          <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>
              {new Intl.DateTimeFormat("fr-FR").format(new Date(student.birthday))}
            </span>
          </div>
          <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            <span>{student.user?.email || "-"}</span>
          </div>
          <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>{student.phone || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
