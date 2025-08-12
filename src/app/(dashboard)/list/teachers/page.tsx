
// src/app/(dashboard)/list/teachers/page.tsx

import { getServerSession } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { TeacherWithDetails } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TableSearch from "@/components/TableSearch";
import Link from "next/link";
import { PlusCircle, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeacherCard from "@/components/cards/TeacherCard";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";

const ITEM_PER_PAGE = 12;

const TeachersPage = async ({ searchParams }: { searchParams: { q: string, p: string } }) => {
    const session = await getServerSession();
    
    if (!session) {
      redirect(`/login`);
    }

    const q = searchParams?.q || "";
    const p = parseInt(searchParams?.p) || 1;

    const query = {
        OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { surname: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
            { user: { username: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { subjects: { some: { name: { contains: q, mode: 'insensitive' } } } },
            { classes: { some: { name: { contains: q, mode: 'insensitive' } } } },
        ],
    };

    const [data, count] = await Promise.all([
        prisma.teacher.findMany({
            where: query as any, 
            include: {
              user: true, // Include all user fields, Prisma handles password omission
              subjects: true,
              classes: true,
            },
            orderBy: [{ surname: 'asc' }, {name: 'asc'}],
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
          }),
          prisma.teacher.count({ where: query as any }),
    ]);
        
    const teachersWithCount: TeacherWithDetails[] = data.map(t => ({
        ...t,
        _count: {
          subjects: t.subjects.length,
          classes: t.classes.length,
        },
    }));

    return (
      <div className="bg-background p-4 md:p-6 rounded-lg flex-1 m-4 mt-0">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground mb-4 md:mb-0">
            Tous les Enseignants
          </h1>
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <TableSearch />
              <div className="flex items-center gap-2 self-end sm:self-auto">
                 <button className="p-2.5 hover:bg-muted rounded-md transition-colors" title="Filtrer">
                  <Filter size={18} className="text-muted-foreground" />
                </button>
                <button className="p-2.5 hover:bg-muted rounded-md transition-colors" title="Trier">
                  <ArrowUpDown size={18} className="text-muted-foreground" />
                </button>
                {session.role === Role.ADMIN && <FormContainer table="teacher" type="create" className={""} />}
              </div>
          </div>
        </div>
        
        {teachersWithCount.length === 0 ? (
          <div className="text-center py-16 bg-muted/50 rounded-lg">
            <p className="text-lg text-muted-foreground">Aucun enseignant trouvé.</p>
            <p className="text-sm mt-2 text-muted-foreground">Essayez d'ajuster votre recherche ou ajoutez un nouvel enseignant.</p>
          </div>
        ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {teachersWithCount.map((teacher, index) => (
                    <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        userRole={session.role}
                        isLCP={index < 4}
                    />
                ))}
            </div>
        )}

        {count > ITEM_PER_PAGE && <Pagination page={p} count={count} />}
      </div>
    );
};

export default TeachersPage;
