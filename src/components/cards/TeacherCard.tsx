// src/components/cards/TeacherCard.tsx
'use client';

import Link from 'next/link';
import { Eye, Trash2, MessageSquare } from 'lucide-react';
import FormContainer from '@/components/FormContainer';
import { Badge } from '@/components/ui/badge';
import DynamicAvatar from '@/components/DynamicAvatar';
import { Role as AppRole, TeacherWithDetails } from '@/types';
import { useState } from 'react';
import MessageModal from '../messaging/MessageModal';

interface TeacherCardProps {
  teacher: TeacherWithDetails;
  userRole?: AppRole;
  isLCP?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, userRole, isLCP = false }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const fullName = `${teacher.name} ${teacher.surname}`;
  const email = teacher.user?.email || 'N/A';
  const viewLink = `/list/teachers/${teacher.id}`;
  const canMessage = userRole === AppRole.ADMIN || userRole === AppRole.PARENT;

  return (
    <>
      <div className="book">
        {/* Front Cover */}
        <div className="cover">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20">
            <DynamicAvatar 
              imageUrl={teacher.img || teacher.user?.img || undefined}
              seed={teacher.user?.email || teacher.id}
              alt={`Avatar de ${fullName}`}
              isLCP={isLCP}
            />
          </div>
          <h3 className="text-xl font-bold text-primary mt-3 truncate w-full">{fullName}</h3>
          <p className="text-sm text-muted-foreground">Enseignant(e)</p>
        </div>

        {/* Inside the book */}
        <div className="flex flex-col h-full w-full justify-between items-center text-center">
            {/* Details */}
            <div className="w-full">
                <h4 className="font-bold text-md truncate">{fullName}</h4>
                <p className="text-xs text-muted-foreground truncate mb-2">{email}</p>
                <hr className="border-t border-border my-2" />

                <div className="text-left mt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Matières:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {teacher.subjects.slice(0, 3).map(subject => (
                        <Badge key={subject.id} variant="secondary" className="text-xs">{subject.name}</Badge>
                        ))}
                        {teacher.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{ teacher.subjects.length - 3 }</Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="w-full mt-auto pt-2 border-t border-border/50 flex justify-center space-x-2">
                <Link href={viewLink} passHref>
                    <button className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-accent-foreground" title="Voir les détails">
                    <Eye size={18} />
                    </button>
                </Link>
                {canMessage && teacher.user?.id && (
                    <button onClick={() => setIsMessageModalOpen(true)} className="p-2 hover:bg-accent rounded-full transition-colors text-blue-500 hover:text-accent-foreground" title="Envoyer un message">
                        <MessageSquare size={18} />
                    </button>
                )}
                {userRole === AppRole.ADMIN && (
                    <FormContainer table="teacher" type="delete" id={teacher.id} />
                )}
            </div>
        </div>
      </div>
      {canMessage && teacher.user?.id && (
        <MessageModal 
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          recipientName={fullName}
          recipientId={teacher.user.id}
        />
      )}
    </>
  );
};
export default TeacherCard;
