
// prisma/seed.js
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const HASH_ROUNDS = 10;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('--- Début du seeding réaliste ---');
        // 1. Nettoyage de la base de données
        console.log('Nettoyage des anciennes données...');
        
        // Defensively check for models before trying to delete
        if (prisma.attendance) {
            yield prisma.attendance.deleteMany({});
        }
        if (prisma.result) {
            yield prisma.result.deleteMany({});
        }
        if (prisma.assignment) {
            yield prisma.assignment.deleteMany({});
        }
        if (prisma.exam) {
            yield prisma.exam.deleteMany({});
        }
        if (prisma.lessonRequirement) {
            yield prisma.lessonRequirement.deleteMany({});
        }
        if (prisma.teacherConstraint) {
            yield prisma.teacherConstraint.deleteMany({});
        }
        if (prisma.scheduleDraft) {
            yield prisma.scheduleDraft.deleteMany({});
        }
        if (prisma.announcement) {
            yield prisma.announcement.deleteMany({});
        }
        if (prisma.event) {
            yield prisma.event.deleteMany({});
        }
        if (prisma.lesson) {
            yield prisma.lesson.deleteMany({});
        }
        if (prisma.student) {
            yield prisma.student.deleteMany({});
        }
        if (prisma.parent) {
            yield prisma.parent.deleteMany({});
        }
        if (prisma.teacher) {
            yield prisma.teacher.deleteMany({});
        }
        if (prisma.admin) {
            yield prisma.admin.deleteMany({});
        }
        if (prisma.class) {
            yield prisma.class.deleteMany({});
        }
        if (prisma.grade) {
            yield prisma.grade.deleteMany({});
        }
        if (prisma.subject) {
            yield prisma.subject.deleteMany({});
        }
        if (prisma.classroom) {
            yield prisma.classroom.deleteMany({});
        }
        // User must be deleted after all profiles that depend on it
        if (prisma.user) {
            yield prisma.user.deleteMany({});
        }
        // School is likely independent, but good to clean
        if (prisma.school) {
            yield prisma.school.deleteMany({});
        }
        console.log('Anciennes données supprimées.');

        // 2. Create School
        console.log('Création de l\'école...');
        yield prisma.school.create({
            data: {
                name: 'Riadh5College',
            }
        });
        console.log('École créée.');

        // 3. Création des utilisateurs Administrateurs
        console.log('Création des administrateurs...');
        const hashedPassword = yield bcryptjs_1.default.hash('password123', HASH_ROUNDS);
        const adminUser1 = yield prisma.user.create({
            data: {
                email: 'admin@example.com',
                username: 'admin',
                password: hashedPassword,
                role: client_1.Role.ADMIN,
                name: 'Admin Principal',
                active: true,
                firstName: 'Admin',
                lastName: 'Principal'
            },
        });
        yield prisma.admin.create({
            data: {
                userId: adminUser1.id,
                name: 'Admin',
                surname: 'Principal',
                phone: '0123456789',
            },
        });
        const adminUser2 = yield prisma.user.create({
            data: {
                email: 'admin1@example.com',
                username: 'admin1',
                password: hashedPassword,
                role: client_1.Role.ADMIN,
                name: 'Admin Secondaire',
                active: true,
                firstName: 'Admin',
                lastName: 'Secondaire'
            },
        });
        yield prisma.admin.create({
            data: {
                userId: adminUser2.id,
                name: 'Admin',
                surname: 'Secondaire',
                phone: '0987654321',
            },
        });
        console.log('Administrateurs créés.');
        // 4. Création des Niveaux (Grades)
        console.log('Création des niveaux...');
        const gradesData = [{ level: 7 }, { level: 8 }, { level: 9 }];
        const grades = yield Promise.all(gradesData.map((grade) => prisma.grade.create({ data: grade })));
        console.log('Niveaux créés.');
        // 5. Création des Salles de classe
        console.log('Création des salles de classe...');
        const classrooms = [];
        for (let i = 1; i <= 22; i++) {
            classrooms.push(yield prisma.classroom.create({ data: { name: `Salle ${i}`, capacity: 30, building: 'Principal' } }));
        }
        for (let i = 1; i <= 2; i++) {
            classrooms.push(yield prisma.classroom.create({ data: { name: `Labo Science ${i}`, capacity: 25, building: 'Sciences' } }));
            classrooms.push(yield prisma.classroom.create({ data: { name: `Labo Physique ${i}`, capacity: 25, building: 'Sciences' } }));
            classrooms.push(yield prisma.classroom.create({ data: { name: `Labo Technique ${i}`, capacity: 25, building: 'Technique' } }));
            classrooms.push(yield prisma.classroom.create({ data: { name: `Gymnase ${i}`, capacity: 40, building: 'Sports' } }));
        }
        console.log(`${classrooms.length} salles créées.`);
        // 6. Création des Matières
        console.log('Création des matières...');
        const subjectNames = [
            'MATHEMATIQUE', 'FRANCAIS', 'ARABE', 'ANGLAIS', 'SCIENCES', 'PHYSIQUE',
            'INFORMATIQUE', 'HISTOIRE', 'GEOGRAPHY', 'EDUCATION CIVILE', 'EDUCATION RELIGIEUSE',
            'ART', 'MUSIQUE', 'EDUCATION SPORTIVE', 'TECHNIQUE'
        ];
        const subjects = yield Promise.all(subjectNames.map((name) => prisma.subject.create({ data: { name, weeklyHours: 2, coefficient: 1 } })));
        const subjectMap = new Map(subjects.map((s) => [s.name, s]));
        console.log('Matières créées.');
        // 7. Création des Classes par niveau
        console.log('Création des classes...');
        const classesByGrade = { 7: [], 8: [], 9: [] };
        const classCounts = { 7: 12, 8: 11, 9: 6 };
        for (const grade of grades) {
            for (let i = 1; i <= classCounts[grade.level]; i++) {
                const newClass = yield prisma.class.create({
                    data: {
                        name: `${grade.level}ème Base ${i}`,
                        capacity: 30,
                        gradeId: grade.id,
                    },
                });
                classesByGrade[grade.level].push(newClass);
            }
        }
        console.log('Classes créées.');
        // 8. Création des Professeurs
        console.log('Création des professeurs...');
        const createdTeachers = [];
        // Professeurs spécialisés
        for (let i = 1; i <= 4; i++) {
            const user = yield prisma.user.create({ data: { email: `prof.sport${i}@example.com`, username: `prof.sport${i}`, password: hashedPassword, role: client_1.Role.TEACHER, name: `Prof Sport ${i}`, active: true, firstName: 'Professeur', lastName: `Sportif ${i}` } });
            createdTeachers.push(yield prisma.teacher.create({ data: { userId: user.id, name: 'Professeur', surname: `Sportif ${i}`, sex: client_1.UserSex.MALE, birthday: new Date(), bloodType: 'A+', subjects: { connect: { id: subjectMap.get('EDUCATION SPORTIVE').id } } } }));
        }
        for (let i = 1; i <= 3; i++) {
            const user = yield prisma.user.create({ data: { email: `prof.musi${i}@example.com`, username: `prof.musi${i}`, password: hashedPassword, role: client_1.Role.TEACHER, name: `Prof Musique ${i}`, active: true, firstName: 'Professeur', lastName: `Musical ${i}` } });
            createdTeachers.push(yield prisma.teacher.create({ data: { userId: user.id, name: 'Professeur', surname: `Musical ${i}`, sex: client_1.UserSex.FEMALE, birthday: new Date(), bloodType: 'B+', subjects: { connect: { id: subjectMap.get('MUSIQUE').id } } } }));
        }
        for (let i = 1; i <= 2; i++) {
            const user = yield prisma.user.create({ data: { email: `prof.art${i}@example.com`, username: `prof.art${i}`, password: hashedPassword, role: client_1.Role.TEACHER, name: `Prof Art ${i}`, active: true, firstName: 'Professeur', lastName: `Artiste ${i}` } });
            createdTeachers.push(yield prisma.teacher.create({ data: { userId: user.id, name: 'Professeur', surname: `Artiste ${i}`, sex: i % 2 === 0 ? client_1.UserSex.FEMALE : client_1.UserSex.MALE, birthday: new Date(), bloodType: 'AB+', subjects: { connect: { id: subjectMap.get('ART').id } } } }));
        }
        for (let i = 1; i <= 3; i++) {
            const user = yield prisma.user.create({ data: { email: `prof.tech${i}@example.com`, username: `prof.tech${i}`, password: hashedPassword, role: client_1.Role.TEACHER, name: `Prof Technique ${i}`, active: true, firstName: 'Professeur', lastName: `Technique ${i}` } });
            createdTeachers.push(yield prisma.teacher.create({ data: { userId: user.id, name: 'Professeur', surname: `Technique ${i}`, sex: client_1.UserSex.MALE, birthday: new Date(), bloodType: 'O+', subjects: { connect: { id: subjectMap.get('TECHNIQUE').id } } } }));
        }
        // Professeurs pour les autres matières
        const coreSubjects = subjects.filter(s => !['EDUCATION SPORTIVE', 'MUSIQUE', 'ART', 'TECHNIQUE'].includes(s.name));
        for (const subject of coreSubjects) {
            for (let i = 1; i <= 3; i++) {
                const sanitizedSubjectName = subject.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const username = `prof.${sanitizedSubjectName}${i}`;
                const user = yield prisma.user.create({ data: { email: `${username}@example.com`, username: username, password: hashedPassword, role: client_1.Role.TEACHER, name: `Prof ${subject.name} ${i}`, active: true, firstName: 'Professeur', lastName: `${subject.name} ${i}` } });
                createdTeachers.push(yield prisma.teacher.create({ data: { userId: user.id, name: 'Professeur', surname: `${subject.name} ${i}`, sex: i % 2 === 0 ? client_1.UserSex.FEMALE : client_1.UserSex.MALE, birthday: new Date(), bloodType: 'O-', subjects: { connect: { id: subject.id } } } }));
            }
        }
        console.log(`${createdTeachers.length} professeurs créés.`);
        // 9. Création des Parents et Étudiants
        console.log('Création des parents et étudiants...');
        let studentCounter = 0;
        const allSystemClasses = Object.values(classesByGrade).flat();
        const totalStudents = allSystemClasses.reduce((acc, cls) => acc + cls.capacity, 0);
        const parents = [];
        for (let i = 1; i <= totalStudents; i++) {
            const parentUser = yield prisma.user.create({ data: { email: `parent${i}@example.com`, username: `parent${i}`, password: hashedPassword, role: client_1.Role.PARENT, name: `Parent ${i}`, active: true, firstName: `ParentPrénom`, lastName: `ParentNom ${i}` } });
            parents.push(yield prisma.parent.create({ data: { userId: parentUser.id, name: `ParentPrénom ${i}`, surname: `ParentNom ${i}` } }));
        }
        for (const cls of allSystemClasses) {
            for (let i = 1; i <= cls.capacity; i++) {
                if(studentCounter >= parents.length) continue; // Safety break
                const studentUser = yield prisma.user.create({ data: { email: `etudiant${studentCounter + 1}@example.com`, username: `etudiant${studentCounter + 1}`, password: hashedPassword, role: client_1.Role.STUDENT, name: `Etudiant ${studentCounter + 1}`, active: true, firstName: `EtudiantPrénom`, lastName: `EtudiantNom ${studentCounter + 1}` } });
                yield prisma.student.create({
                    data: {
                        userId: studentUser.id,
                        name: `EtudiantPrénom ${studentCounter + 1}`,
                        surname: `EtudiantNom ${studentCounter + 1}`,
                        address: `${studentCounter + 1} Rue de l'Exemple`,
                        birthday: new Date('2010-01-01'),
                        sex: i % 2 === 0 ? client_1.UserSex.FEMALE : client_1.UserSex.MALE,
                        bloodType: 'O+',
                        classId: cls.id,
                        gradeId: cls.gradeId,
                        parentId: parents[studentCounter].id,
                    },
                });
                studentCounter++;
            }
        }
        console.log(`${parents.length} parents et ${studentCounter} étudiants créés.`);
        // 10. Ajout de données exemples pour Annonces et Événements
        console.log("Ajout d'annonces et d'événements exemples...");
        yield prisma.announcement.create({
            data: {
                title: "Réunion parents-professeurs",
                description: "La réunion annuelle parents-professeurs aura lieu la semaine prochaine.",
                date: new Date(),
            }
        });
        yield prisma.event.create({
            data: {
                title: "Fête de fin d'année",
                description: "Célébration de la fin de l'année scolaire dans la cour de l'école.",
                startTime: new Date(new Date().setDate(new Date().getDate() + 7)),
                endTime: new Date(new Date().setDate(new Date().getDate() + 7) + 2 * 60 * 60 * 1000),
            }
        });
        console.log("Données exemples ajoutées.");
        console.log('--- Seeding réaliste terminé avec succès ---');
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield main();
    }
    catch (e) {
        console.error(e);
        process.exit(1);
    }
    finally {
        yield prisma.$disconnect();
    }
}))();
