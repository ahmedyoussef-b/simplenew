
// src/app/(dashboard)/teacher/page.tsx
import TimetableDisplay from "@/components/schedule/TimetableDisplay";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import type { WizardData, ClassWithGrade, TeacherWithDetails, Subject, Classroom, Lesson } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { notFound } from 'next/navigation';

const TeacherPage = async () => {
  console.log("🧑‍🏫 [TeacherPage] Rendu de la page d'accueil de l'enseignant. Vérification de la session.");
  const session = await getServerSession();

  if (!session || !session.user || session.user.role !== Role.TEACHER) { 
     console.warn("🧑‍🏫 [TeacherPage] Session invalide ou rôle incorrect. Redirection...");
     redirect(session ? `/${(session.user.role as string).toLowerCase()}` : `/login`);
  }

  const teacherFromDb = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        subjects: true,
        lessons: { select: { classId: true }, distinct: ['classId'] }
      }
  });

  if (!teacherFromDb) {
    console.error("🧑‍🏫 [TeacherPage] Profil enseignant non trouvé pour l'ID utilisateur:", session.user.id);
    return (
      <div className="p-4 md:p-6 text-center">
        <Card className="inline-block p-8">
            <CardHeader>
                <CardTitle>Profil Enseignant Non Trouvé</CardTitle>
                <CardDescription>
                  Aucun profil d'enseignant n'est associé à ce compte. Veuillez contacter l'administration.
                </CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }
  
  // --- REFACTORED DATA FETCHING ---

  const lessonsFromDb = await prisma.lesson.findMany({
    where: { teacherId: teacherFromDb.id },
    select: {
      id: true, name: true, day: true, startTime: true, endTime: true,
      subjectId: true, classId: true, teacherId: true, createdAt: true,
      updatedAt: true, classroomId: true, scheduleDraftId: true,
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
  });

  const lessons: Lesson[] = lessonsFromDb.map(lesson => ({
    ...lesson,
    startTime: lesson.startTime.toISOString(),
    endTime: lesson.endTime.toISOString(),
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
  }));
  
  const classIds = [...new Set(lessons.map(l => l.classId))];

  const teacherClasses = await prisma.class.findMany({
    where: { id: { in: classIds as number[] } },
    include: { grade: true },
  }) as unknown as ClassWithGrade[];

  const [allSubjects, allClassrooms, allTeachersFromDb] = await Promise.all([
    prisma.subject.findMany(),
    prisma.classroom.findMany(),
    prisma.teacher.findMany({ 
        include: { 
            user: true, 
            subjects: true, 
            lessons: { select: { classId: true }, distinct: ['classId'] } 
        } 
    }),
  ]);
  
  const allTeachers: TeacherWithDetails[] = allTeachersFromDb.map(t => ({
      ...t,
      classes: [],
      _count: {
          subjects: t.subjects.length,
          classes: new Set(t.lessons.map(l => l.classId)).size,
          lessons: t.lessons.length
      }
  }));

  const wizardData: WizardData = {
    school: {
      name: 'Mon Emploi du Temps',
      startTime: '08:00',
      endTime: '17:00',
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      sessionDuration: 60,
      scheduleDraftId: null,
      schoolConfig: {}
    },
    classes: teacherClasses,
    subjects: allSubjects as Subject[],
    teachers: allTeachers, // Pass all teachers
    rooms: allClassrooms as Classroom[],
    grades: [],
    lessonRequirements: [],
    teacherConstraints: [],
    subjectRequirements: [],
    teacherAssignments: [],
    schedule: lessons,
    scheduleDraftId: null
  };
  
  console.log("🧑‍🏫 [TeacherPage] Rendu de l'emploi du temps.");
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Mon Emploi du Temps Personnel</CardTitle>
          <CardDescription>
            Consultez votre emploi du temps par classe ou pour vous-même.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TimetableDisplay 
            wizardData={wizardData} 
            viewMode={"teacher"} 
            selectedViewId={teacherFromDb.id} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherPage;
