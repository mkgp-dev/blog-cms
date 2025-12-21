import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Outlet } from "react-router";

export default function AdminLayout() {

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
                    <SidebarTrigger />
                    <div className="text-sm text-muted-foreground">Dashboard</div>
                </header>
                <main className="flex-1 p-6">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}