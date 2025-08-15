// src/app/(dashboard)/list/classes/page.tsx

// --- SERVER-SIDE IMPORTS ---
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import type { Class, Grade, Role as AppRole } from "@/types/index";
import { Prisma } from "@prisma/client";
import GradeCard from "@/components/classes/GradeCard";
import ClassCard from "@/components/classes/ClassCard";
import React from 'react';

// --- TYPE DEFINITIONS ---
type GradeWithClassCount = Grade & {
  _count: { classes: number };
};

type ClassWithDetails = Omit<Class, 'supervisorId'> & {
  _count: { students: number };
};

interface ClassesPageClientProps {
    grades: GradeWithClassCount[];
    classes: ClassWithDetails[];
    userRole?: AppRole;
    initialGradeIdParam: string | null;
}


// --- CLIENT COMPONENT ---
const ClassesPageContent: React.FC<ClassesPageClientProps> = ({ grades, classes, userRole, initialGradeIdParam }) => {
  'use client'; // This directive ONLY applies to this component and its children.
  
  // Client-side imports are placed here
  const { useState } = React;
  const { useRouter } = require('next/navigation');
  const FormContainer = require("@/components/FormContainer").default;
  const Link = require("next/link").default;
  const { Button } = require("@/components/ui/button");
  const { ArrowLeft, Layers3 } = require("lucide-react");
  const { cn } = require("@/lib/utils");
  

  const router = useRouter();
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(initialGradeIdParam ? Number(initialGradeIdParam) : null);

  const selectedGrade = selectedGradeId ? grades.find(g => g.id === selectedGradeId) : null;
  const classesInGrade = selectedGradeId ? classes.filter(c => c.gradeId === selectedGradeId) : [];
  
  const handleGradeSelect = (gradeId: number) => {
    setSelectedGradeId(gradeId);
    router.push(`/list/classes?viewGradeId=${gradeId}`, { scroll: false });
  };
  
  const handleBackToGrades = () => {
    setSelectedGradeId(null);
    router.push('/list/classes', { scroll: false });
  };

  if (selectedGradeId && selectedGrade) {
    return (
      <div className="p-4 md:p-6 animate-in fade-in-0 duration-500">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={handleBackToGrades}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux Niveaux 
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            {`Classes du Niveau ${selectedGrade.level}`} 
          </h1>
          {userRole === AppRole.ADMIN && (
            <FormContainer
              table="class"
              type="create"
              data={{ gradeId: selectedGrade.id, gradeLevel: selectedGrade.level }}
            />
          )}
        </div>

        {classesInGrade.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Aucune classe trouvée dans ce niveau.</p> 
            {userRole === AppRole.ADMIN && <p className="text-sm mt-2 text-muted-foreground">Vous pouvez en ajouter une avec le bouton ci-dessus.</p>} 
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classesInGrade.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem}  />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers3 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Niveaux Scolaires</h1> 
              <p className="text-muted-foreground text-sm">Organisez et gérez les niveaux et les classes de votre établissement.</p>
            </div>
        </div>
        {userRole === AppRole.ADMIN && (
          <FormContainer table="grade" type="create" />
        )}
      </div>

      {grades.length === 0 ? (
         <div className="text-center py-16 bg-muted/50 rounded-lg">
            <p className="text-lg text-muted-foreground">Aucun niveau trouvé.</p> 
            {userRole === AppRole.ADMIN && <p className="text-sm mt-2 text-muted-foreground">Pensez à ajouter le premier niveau pour commencer.</p>} 
          </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {grades.map((grade) => ( 
             <div 
                key={grade.id}
                className={cn(
                    "transition-all duration-500 ease-in-out",
                    selectedGradeId && selectedGradeId !== grade.id ? "opacity-0 scale-90" : "opacity-100 scale-100"
                )}
              >
              <GradeCard grade={grade} userRole={userRole} onSelect={() => handleGradeSelect(grade.id)}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- SERVER COMPONENT (Default Export) ---
// This component fetches data on the server and passes it to the client component.
export default async function ServerClassesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
    const session = await getServerSession();
    const userRole = session?.user?.role as AppRole | undefined;

    const gradesData: GradeWithClassCount[] = await prisma.grade.findMany({
        include: {
        _count: { select: { classes: true } },
        },
        orderBy: { level: 'asc' },
    });

    const classesData: ClassWithDetails[] = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } },
        grade: true,
      },
      orderBy: { name: 'asc' },
    });

    const initialGradeIdParam = typeof searchParams?.viewGradeId === 'string' ? searchParams.viewGradeId : null;

    return <ClassesPageContent 
        grades={gradesData} 
        classes={classesData} 
        userRole={userRole}
        initialGradeIdParam={initialGradeIdParam}
    />;
}
