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
      <div className="entity-card">
        <div className="entity-card2">
           <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
              <DynamicAvatar 
                imageUrl={parent.img || parent.user?.img}
                seed={parent.id || parent.user?.email || Math.random().toString(36).substring(7)}
                isLCP={isLCP}
              />
            </div>
            <h3 className="text-lg font-bold truncate w-full text-center">{fullName}</h3>
            <p className="text-sm text-gray-400 mb-2">Parent</p>
            
            <hr className="w-full border-t border-gray-700 my-2" />
            
            <div className="text-left w-full mt-2">
                <p className="text-xs font-semibold text-gray-400 mb-1">Enfants:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                    {parent.students.slice(0, 2).map(student => (
                    <Badge key={student.id} variant="secondary" className="text-xs bg-gray-600 text-white">{student.name} {student.surname}</Badge>
                    ))}
                    {parent.students.length > 2 && (
                    <Badge variant="outline" className="text-xs">+{ parent.students.length - 2 }</Badge>
                    )}
                </div>
            </div>

            <div className="w-full mt-auto pt-2 border-t border-gray-700/50 flex justify-center space-x-2">
                <Link href={viewLink} passHref>
                    <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white" title="Voir les détails">
                    <Eye size={18} />
                    </button>
                </Link>
                {canMessage && parent.user?.id && (
                    <button onClick={() => setIsMessageModalOpen(true)} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-blue-400 hover:text-white" title="Envoyer un message">
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
