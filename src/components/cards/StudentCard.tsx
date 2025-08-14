// src/components/cards/StudentCard.tsx
'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import FormContainer from '@/components/FormContainer';
import { Badge } from '@/components/ui/badge';
import DynamicAvatar from '@/components/DynamicAvatar';
import {Role, StudentWithClassAndUser } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StudentCardProps {
  student: StudentWithClassAndUser;
  userRole?: Role;
  isLCP?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, userRole, isLCP = false }) => {
  const fullName = `${student.name} ${student.surname}`;
  const viewLink = `/list/students/${student.id}`;

  return (

    <><Card className="flex flex-col overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <CardHeader className="p-0 relative h-20 bg-gradient-to-r from-primary/20 to-accent/20">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 transform">
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-background bg-background shadow-lg">
                      <DynamicAvatar
                          imageUrl={student.img || student.user?.img || undefined}
                          seed={student.id || student.user?.email}
                          alt={`Avatar de ${fullName}`}
                          isLCP={isLCP} />
                  </div>
              </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow items-center text-center p-4 pt-20">
              <h3 className="text-lg font-bold text-foreground truncate w-full">{fullName}</h3>
              <p className="text-sm text-muted-foreground">Élève</p>
              <p className="text-xs text-muted-foreground truncate w-full mt-1">{student.user?.email}</p>

              <div className="mt-4 w-full border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Classe:</p>
                  <Badge variant="default" className="text-sm">{student.class?.name || 'N/A'}</Badge>
              </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-2 flex justify-center space-x-1">
              <Link href={viewLink} passHref>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent-foreground" title="Voir les détails">
                      <Eye size={18} />
                  </Button>
              </Link>
              {userRole === Role.ADMIN && (
                  <FormContainer table="student" type="delete" id={student.id} />
              )}
          </CardFooter>
      </Card><div className="entity-card">
              <div className="entity-card2">
                  <div className="relative h-20 w-20 rounded-full overflow-hidden mb-3">
                      <DynamicAvatar
                          imageUrl={student.img || student.user?.img}
                          seed={student.id || student.user?.email || Math.random().toString(36).substring(7)}
                          isLCP={isLCP} />
                  </div>
                  <h3 className="text-lg font-bold truncate w-full text-center">{fullName}</h3>
                  <p className="text-sm text-gray-400 mb-2">Élève</p>

                  <hr className="w-full border-t border-gray-700 my-2" />

                  <div className="w-full mt-2 text-center">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Classe:</p>
                      <Badge variant="default" className="text-sm bg-blue-500/20 text-blue-300">{student.class?.name || 'N/A'}</Badge>
                  </div>

                  <div className="w-full mt-auto pt-2 border-t border-gray-700/50 flex justify-center space-x-2">
                      <Link href={viewLink} passHref>
                          <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white" title="Voir les détails">
                              <Eye size={18} />
                          </button>
                      </Link>
                      {userRole === Role.ADMIN && (
                          <FormContainer table="student" type="delete" id={student.id} />
                      )}
                  </div>
              </div>
          </div></>

  );
};

export default StudentCard;
