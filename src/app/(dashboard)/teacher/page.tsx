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

  if (!session || session.user.role !== Role.TEACHER) { 
     console.warn("🧑‍🏫 [TeacherPage] Session invalide ou rôle incorrect. Redirection...");
     redirect(session ? `/${(session.user.role as string).toLowerCase()}` : `/login`);
  }

  const teacher = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        subjects: true,
        classes: true,
        _count: {
          select: {
            classes: true,
            subjects: true,
          }
        }
      }
  });

  if (!teacher) {
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
  
  console.log(`🧑‍🏫 [TeacherPage] Profil enseignant trouvé pour ${teacher.name}. Récupération des données de l'emploi du temps.`);

  // --- REFACTORED DATA FETCHING ---

  // 1. Fetch only the lessons for this teacher to get class IDs and for the schedule display
  const lessonsFromDb = await prisma.lesson.findMany({
    where: { teacherId: teacher.id }, // Use the teacher's actual ID
    select: {
      id: true,
      name: true,
      day: true,
      startTime: true,
      endTime: true,
      subjectId: true,
      classId: true,
      teacherId: true,
      createdAt: true, // Include createdAt
      updatedAt: true, // Include updatedAt
      classroomId: true,
      scheduleDraftId: true, // Include scheduleDraftId
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
  
  // 2. Extract unique class IDs from the lessons
  const classIds = [...new Set(lessons.map(l => l.classId))];

  // 3. Fetch only the classes this teacher teaches in, with their grades
  const teacherClasses = await prisma.class.findMany({
    where: { id: { in: classIds } },
    include: { grade: true },
  }) as ClassWithGrade[];

  // 4. Fetch all subjects and classrooms for context mapping
  const [allSubjects, allClassrooms] = await Promise.all([
    prisma.subject.findMany(),
    prisma.classroom.findMany(),
  ]);
  
  console.log(`🧑‍🏫 [TeacherPage] ${lessons.length} leçons, ${teacherClasses.length} classes, et ${allSubjects.length} matières récupérées.`);

  // 5. Construct wizardData with filtered data
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
    classes: teacherClasses, // Use the explicitly filtered classes
    subjects: allSubjects as Subject[],
    teachers: [teacher] as TeacherWithDetails[], // Only this teacher
    rooms: allClassrooms as Classroom[],
    grades: [],
    lessonRequirements: [],
    teacherConstraints: [],
    subjectRequirements: [],
    teacherAssignments: [],
    schedule: lessons,
    scheduleDraftId: null
  };
  
  // --- END REFACTORED DATA FETCHING ---
  
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
          <TimetableDisplay wizardData={wizardData} viewMode={"class"} selectedViewId={""} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherPage;
