// src/components/dashboard/admin/AdminSidebar.tsx
import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";

interface AdminSidebarProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const AdminSidebar = async ({ searchParams }: AdminSidebarProps) => {
    console.log("🗓️ [AdminSidebar] Rendu du conteneur de la barre latérale.");
    return (
        <>
            <EventCalendarContainer date={searchParams.date} />
            <div className="flex-1 min-h-0">
                <Announcements />
            </div>
        </>
    );
};

export default AdminSidebar;
