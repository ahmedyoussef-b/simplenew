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
            lessons: lessons.filter(l => l.teacherId === t.id).length
        },
      };
    });

    const defaultSchoolConfig: SchoolData = {
      id: school?.id ? Number(school.id) : undefined,
      name: school?.name || "Collège Riadh 5",
      startTime: '08:00',
      endTime: '17:00',
      sessionDuration: 60,
      schoolDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
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
        scheduleDraftId: null,
    });
}
