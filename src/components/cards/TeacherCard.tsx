// src/components/cards/TeacherCard.tsx
'use client';

import Link from 'next/link';
import { Eye, MessageSquare } from 'lucide-react';
import FormContainer from '@/components/FormContainer';
import { Badge } from '@/components/ui/badge';
import DynamicAvatar from '@/components/DynamicAvatar';
import { useState } from 'react';
import MessageModal from '../messaging/MessageModal';
import { Role as AppRole, TeacherWithDetails } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TeacherCardProps {
  teacher: TeacherWithDetails;
  userRole?: AppRole;
  isLCP?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, userRole, isLCP = false }) => {
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const fullName = `${teacher.name} ${teacher.surname}`;
  const viewLink = `/list/teachers/${teacher.id}`;
  const canMessage = userRole === AppRole.ADMIN || userRole === AppRole.PARENT;

  return (
    <>
<<<<<<< HEAD
      <Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardHeader className="p-0 relative h-20 bg-gradient-to-r from-primary/20 to-accent/20">
           <div className="absolute top-5 left-1/2 -translate-x-1/2 transform">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-background bg-background shadow-lg">
                    <DynamicAvatar 
                        imageUrl={teacher.img || teacher.user?.img || undefined}
                        seed={teacher.user?.email || teacher.id}
                        alt={`Avatar de ${fullName}`}
                        isLCP={isLCP}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col flex-grow items-center text-center p-4 pt-20">
            <h3 className="text-lg font-bold text-foreground truncate w-full">{fullName}</h3>
            <p className="text-sm text-muted-foreground">Enseignant(e)</p>
            <p className="text-xs text-muted-foreground truncate w-full mt-1">{email}</p>
            
            <div className="mt-4 w-full border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Matières Principales:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                    {teacher.subjects.slice(0, 3).map(subject => (
                    <Badge key={subject.id} variant="secondary" className="text-xs">{subject.name}</Badge>
=======
      <div className="entity-card">
          <div className="entity-card2">
            <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
              <DynamicAvatar 
                imageUrl={teacher.img || teacher.user?.img}
                seed={teacher.id || teacher.user?.email || Math.random().toString(36).substring(7)}
                isLCP={isLCP}
              />
            </div>
            <h3 className="text-lg font-bold truncate w-full text-center">{fullName}</h3>
            <p className="text-sm text-gray-400 mb-2">Enseignant(e)</p>
            
            <div className="flex justify-around w-full my-3 text-center">
                <div>
                    <p className="font-bold text-lg">{teacher._count.subjects}</p>
                    <p className="text-xs text-gray-400">Matières</p>
                </div>
                <div>
                    <p className="font-bold text-lg">{teacher._count.classes}</p>
                    <p className="text-xs text-gray-400">Classes</p>
                </div>
            </div>

            <hr className="w-full border-t border-gray-700 my-2" />

            <div className="text-center w-full mt-2 flex-grow">
                <p className="text-xs font-semibold text-gray-400 mb-1">Matières principales :</p>
                <div className="flex flex-wrap gap-1 justify-center">
                    {teacher.subjects.slice(0, 3).map(subject => (
                    <Badge key={subject.id} variant="secondary" className="text-xs bg-gray-600 text-white">{subject.name}</Badge>
>>>>>>> 73e4183dfa595f1ae91e3fffdc8752043e0e28c0
                    ))}
                    {teacher.subjects.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{ teacher.subjects.length - 3 }</Badge>
                    )}
<<<<<<< HEAD
                     {teacher.subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Aucune matière</p>
                    )}
                </div>
=======
                </div>
            </div>

            <div className="w-full mt-auto pt-2 border-t border-gray-700/50 flex justify-center space-x-2">
                <Link href={viewLink} passHref>
                    <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white" title="Voir les détails">
                    <Eye size={18} />
                    </button>
                </Link>
                {canMessage && teacher.user?.id && (
                    <button onClick={() => setIsMessageModalOpen(true)} className="p-2 hover:bg-gray-700 rounded-full transition-colors text-blue-400 hover:text-white" title="Envoyer un message">
                        <MessageSquare size={18} />
                    </button>
                )}
                {userRole === AppRole.ADMIN && (
                    <FormContainer table="teacher" type="delete" id={teacher.id} />
                )}
>>>>>>> 73e4183dfa595f1ae91e3fffdc8752043e0e28c0
            </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-2 flex justify-center space-x-1">
             <Link href={viewLink} passHref>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent-foreground" title="Voir les détails">
                    <Eye size={18} />
                </Button>
            </Link>
            {canMessage && teacher.user?.id && (
                <Button variant="ghost" size="icon" onClick={() => setIsMessageModalOpen(true)} className="text-blue-500 hover:text-accent-foreground" title="Envoyer un message">
                    <MessageSquare size={18} />
                </Button>
            )}
            {userRole === AppRole.ADMIN && (
                <FormContainer table="teacher" type="delete" id={teacher.id} />
            )}
        </CardFooter>
      </Card>
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
