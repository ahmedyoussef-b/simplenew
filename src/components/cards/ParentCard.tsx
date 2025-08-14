// src/components/cards/ParentCard.tsx
'use client';

import Link from 'next/link';
import { Eye, MessageSquare } from 'lucide-react';
import FormContainer from '@/components/FormContainer';
import { Badge } from '@/components/ui/badge';
import DynamicAvatar from '@/components/DynamicAvatar';
import { useState } from 'react';
import MessageModal from '@/components/messaging/MessageModal';
import { Role as AppRole, ParentWithDetails } from '@/types';

interface ParentCardProps {
  parent: ParentWithDetails;
  userRole?: AppRole;
  isLCP?: boolean;
  isAssociated: boolean;
}

const ParentCard: React.FC<ParentCardProps> = ({ parent, userRole, isLCP = false, isAssociated }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const fullName = `${parent.name} ${parent.surname}`;
  const viewLink = `/list/parents/${parent.id}`;
  const canMessage = userRole === AppRole.ADMIN || (userRole === AppRole.TEACHER && isAssociated);

  return (
    <>
      <div className="book">
        {/* Front Cover */}
        <div className="cover">
          <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20">
            <DynamicAvatar 
              imageUrl={parent.img || parent.user?.img}
              seed={parent.id || parent.user?.email || Math.random().toString(36).substring(7)}
              isLCP={isLCP}
            />
          </div>
          <h3 className="text-xl font-bold text-primary mt-3 truncate w-full">{fullName}</h3>
          <p className="text-sm text-muted-foreground">Parent</p>
        </div>

        {/* Inside the book */}
        <div className="flex flex-col h-full w-full justify-between items-center text-center">
            {/* Details */}
            <div className="w-full">
                <h4 className="font-bold text-md truncate">{fullName}</h4>
                <p className="text-xs text-muted-foreground truncate mb-2">{parent.user?.email}</p>
                <hr className="border-t border-border my-2" />

                <div className="text-left mt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Enfants:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                        {parent.students.slice(0, 2).map(student => (
                        <Badge key={student.id} variant="secondary" className="text-xs">{student.name} {student.surname}</Badge>
                        ))}
                        {parent.students.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{ parent.students.length - 2 }</Badge>
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
                {canMessage && parent.user?.id && (
                    <button onClick={() => setIsMessageModalOpen(true)} className="p-2 hover:bg-accent rounded-full transition-colors text-blue-500 hover:text-accent-foreground" title="Envoyer un message">
                        <MessageSquare size={18} />
                    </button>
                )}
                {userRole === AppRole.ADMIN && (
                    <FormContainer table="parent" type="delete" id={parent.id} />
                )}
            </div>
        </div>
      </div>
      {canMessage && parent.user?.id && (
        <MessageModal 
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          recipientName={fullName}
          recipientId={parent.user.id}
        />
      )}
    </>
  );
};

export default ParentCard;
