
// src/lib/data-fetching/fetch-wizard-data.ts
import prisma from "@/lib/prisma";
import type { WizardData, ClassWithGrade, TeacherWithDetails, Subject, Classroom, Grade, LessonRequirement, TeacherConstraint, SubjectRequirement, TeacherAssignment, SchoolData, Lesson } from '@/types';

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
      prisma.lesson.findMany()
    ]);
    
    const teachers: TeacherWithDetails[] = teachersFromDb.map(t => {
      const classIds = new Set(t.lessons.map(l => l.classId));
      return {
        ...t,
        classes: [], // This will be populated if needed, but count is the main thing
        _count: {
            subjects: t.subjects.length,
            classes: classIds.size,
        },
      };
    });


    // This is now the definitive default structure for school configuration
    const defaultSchoolConfig: SchoolData = {
      id: school?.id ? Number(school.id) : undefined, // Convert id to number if it exists
      name: school?.name || "Collège Riadh 5",
      startTime: '08:00',
      endTime: '17:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      scheduleDraftId: null,
      schoolConfig: {}
    };

    // Make all fetched data serializable before returning
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
        schedule: lessons, // Schedule is dynamic, starts empty
    });
}
