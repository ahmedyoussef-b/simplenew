// src/lib/data-fetching/fetch-wizard-data.ts
import prisma from "@/lib/prisma";
import type { WizardData, ClassWithGrade, TeacherWithDetails, Subject, Classroom, Grade, LessonRequirement, TeacherConstraint, SubjectRequirement, TeacherAssignment, SchoolData, Lesson } from '@/types';
import { getServerSession } from "../auth-utils";

// Helper function to make an object serializable
const toSerializable = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        // Convert Date objects to ISO strings
        if (value && typeof value === 'object' && value.constructor === Date) {
            return value.toISOString();
        }
        return value;
    }));
};


export async function fetchAllDataForWizard(): Promise<WizardData> {
    const session = await getServerSession();

    // Find the active draft for the current user.
    // The user ID part is crucial for multi-user scenarios, although not fully implemented yet.
    const activeDraft = await prisma.scheduleDraft.findFirst({
        where: { 
            // userId: session?.user.id, // Uncomment when multi-user draft is needed
            isActive: true 
        },
        include: { lessons: true }
    });

    if (activeDraft) {
        // If an active draft is found, reconstruct the wizard data from it.
        // This ensures that any page calling this function gets the most up-to-date working schedule.
        const [
            allClasses,
            allSubjects,
            allTeachersFromDb,
            allRooms,
            allGrades,
            allLessonRequirements,
            allTeacherConstraints,
            allSubjectRequirements,
            allTeacherAssignments
        ] = await Promise.all([
            prisma.class.findMany({ where: { id: { in: JSON.parse(activeDraft.classes as string || '[]') } }, include: { grade: true, _count: { select: { students: true, lessons: true } } } }),
            prisma.subject.findMany({ where: { id: { in: JSON.parse(activeDraft.subjects as string || '[]') } } }),
            prisma.teacher.findMany({ where: { id: { in: JSON.parse(activeDraft.teachers as string || '[]') } }, include: { user: true, subjects: true, lessons: { select: { classId: true }, distinct: ['classId'] } } }),
            prisma.classroom.findMany({ where: { id: { in: JSON.parse(activeDraft.classrooms as string || '[]') } } }),
            prisma.grade.findMany({ where: { id: { in: JSON.parse(activeDraft.grades as string || '[]') } } }),
            prisma.lessonRequirement.findMany({ where: { scheduleDraftId: activeDraft.id } }),
            prisma.teacherConstraint.findMany({ where: { scheduleDraftId: activeDraft.id } }),
            prisma.subjectRequirement.findMany({ where: { scheduleDraftId: activeDraft.id } }),
            prisma.teacherAssignment.findMany({ where: { scheduleDraftId: activeDraft.id } })
        ]);

        const teachers: TeacherWithDetails[] = allTeachersFromDb.map(t => ({
            ...t,
            classes: [],
            _count: { subjects: t.subjects.length, classes: new Set(t.lessons.map(l => l.classId)).size },
        }));

        return toSerializable({
            school: JSON.parse(activeDraft.schoolConfig as string || '{}'),
            classes: allClasses,
            subjects: allSubjects,
            teachers: teachers,
            rooms: allRooms,
            grades: allGrades,
            lessonRequirements: allLessonRequirements,
            teacherConstraints: allTeacherConstraints,
            subjectRequirements: allSubjectRequirements,
            teacherAssignments: allTeacherAssignments,
            schedule: activeDraft.lessons,
        });
    }

    // --- Fallback Logic: If no active draft is found, fetch all data from the DB ---
    const [
      school,
      classes,
      subjects,
      teachersFromDb,
      rooms,
      grades,
      lessonRequirements,
      teacherConstraints,
      subjectRequirements,
      teacherAssignments,
      lessons
    ] = await Promise.all([
      prisma.school.findFirst(),
      prisma.class.findMany({ include: { grade: true, _count: { select: { students: true, lessons: true } } } }),
      prisma.subject.findMany({orderBy: {name: 'asc'}}),
      prisma.teacher.findMany({ include: { user: true, subjects: true, lessons: { select: { classId: true }, distinct: ['classId'] } } }),
      prisma.classroom.findMany({orderBy: {name: 'asc'}}),
      prisma.grade.findMany({orderBy: {level: 'asc'}}),
      prisma.lessonRequirement.findMany(),
      prisma.teacherConstraint.findMany(),
      prisma.subjectRequirement.findMany(),
      prisma.teacherAssignment.findMany(),
      prisma.lesson.findMany() // Fetch the "master" schedule
    ]);
    
    const teachers: TeacherWithDetails[] = teachersFromDb.map(t => {
      const classIds = new Set(t.lessons.map(l => l.classId));
      return {
        ...t,
        classes: [],
        _count: {
            subjects: t.subjects.length,
            classes: classIds.size,
        },
      };
    });

    const defaultSchoolConfig: SchoolData = {
      id: school?.id ? Number(school.id) : undefined,
      name: school?.name || "Collège Riadh 5",
      startTime: '08:00',
      endTime: '17:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      scheduleDraftId: null,
      schoolConfig: {}
    };

    return toSerializable({
        school: defaultSchoolConfig,
        classes: classes,
        subjects: subjects,
        teachers: teachers,
        rooms: rooms,
        grades: grades,
        lessonRequirements: lessonRequirements,
        teacherConstraints: teacherConstraints,
        subjectRequirements: subjectRequirements,
        teacherAssignments: teacherAssignments,
        schedule: lessons,
    });
}
