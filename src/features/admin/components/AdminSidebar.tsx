import { LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/common/auth/useAuth";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import {
    SIDEBAR_LIST,
    type SidebarDefinition,
} from "@/features/admin/lib/sidebar-links";

export default function AdminSidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <div className="flex aspect-square size-8 items-center justify-center">
                                <img src="/logo.png" alt="logo" title="logo" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-medium">Personal Blog CMS</span>
                                <span>v1.1.0</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Content</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {SIDEBAR_LIST.map((item: SidebarDefinition) => (
                                <SidebarMenuItem key={item.path}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.path} end>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator className="mx-0" />
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton className="cursor-pointer" onClick={handleLogout}>
                                    <LogOut />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
