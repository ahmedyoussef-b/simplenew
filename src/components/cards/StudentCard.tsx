// src/components/cards/StudentCard.tsx
'use client';

import Link from 'next/link';
import { Eye, Trash2 } from 'lucide-react';
import FormContainer from '@/components/FormContainer';
import { Badge } from '@/components/ui/badge';
import DynamicAvatar from '@/components/DynamicAvatar';
import {Role, StudentWithClassAndUser } from '@/types';

interface StudentCardProps {
  student: StudentWithClassAndUser;
  userRole?: Role;
  isLCP?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, userRole, isLCP = false }) => {
  const fullName = `${student.name} ${student.surname}`;
  const email = student.user?.email || 'N/A';
  const viewLink = `/list/students/${student.id}`;

  return (
    <div className="book">
      {/* Front Cover */}
      <div className="cover">
        <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20">
          <DynamicAvatar 
            imageUrl={student.img || student.user?.img}
            seed={student.id || student.user?.email || Math.random().toString(36).substring(7)}
            isLCP={isLCP}
          />
        </div>
        <h3 className="text-xl font-bold text-primary mt-3 truncate w-full">{fullName}</h3>
        <p className="text-sm text-muted-foreground">Élève</p>
      </div>

      {/* Inside the book */}
      <div className="flex flex-col h-full w-full justify-between items-center text-center">
          {/* Details */}
          <div className="w-full">
              <h4 className="font-bold text-md truncate">{fullName}</h4>
              <p className="text-xs text-muted-foreground truncate mb-2">{email}</p>
              <hr className="border-t border-border my-2" />

              <div className="mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Classe:</p>
                  <Badge variant="default" className="text-sm">{student.class?.name || 'N/A'}</Badge>
              </div>
          </div>

          {/* Actions */}
          <div className="w-full mt-auto pt-2 border-t border-border/50 flex justify-center space-x-2">
              <Link href={viewLink} passHref>
                  <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-accent-foreground" title="Voir les détails">
                  <Eye size={18} />
                  </button>
              </Link>
              {userRole === Role.ADMIN && (
                  <FormContainer table="student" type="delete" id={student.id} />
              )}
          </div>
      </div>
    </div>
  );
};

export default StudentCard;
