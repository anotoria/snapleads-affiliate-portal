import { 
  LayoutDashboard, 
  Users, 
  Award, 
  DollarSign, 
  HelpCircle, 
  Shield, 
  ArrowLeft,
  Wallet,
  BookOpen,
  ImageIcon,
  Briefcase
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isSuperAdmin } = useAdminAccess();

  const navItems = [
    { title: t.nav.adminDashboard, url: "/admin", icon: LayoutDashboard },
    { title: t.nav.adminUsers, url: "/admin/affiliates", icon: Users },
    { title: "Minha Carteira", url: "/admin/my-affiliates", icon: Briefcase },
    { title: t.nav.adminTiers, url: "/admin/tiers", icon: Award },
    { title: t.nav.adminPricing, url: "/admin/pricing", icon: DollarSign },
    { title: t.nav.adminTracks, url: "/admin/tracks", icon: BookOpen },
    { title: t.nav.adminMedia, url: "/admin/media", icon: ImageIcon },
    { title: t.nav.adminSupport, url: "/admin/support", icon: HelpCircle },
  ];

  // Only super admins can manage other admins and see SA commissions
  if (isSuperAdmin) {
    navItems.push({ title: t.nav.adminSACommissions, url: "/admin/sa-commissions", icon: Wallet });
    navItems.push({ title: t.nav.adminAdmins, url: "/admin/admins", icon: Shield });
  }

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar 
      className="border-r border-sidebar-border bg-sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4 dark:bg-primary dark:rounded-lg dark:m-2 dark:mb-0 dark:border-none flex justify-center">
        <Logo collapsed={collapsed} size={collapsed ? "sm" : "md"} showSubtitle={!collapsed} centered />
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Admin Badge */}
        {!collapsed && (
          <div className="mb-4 px-3">
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{t.common.adminMode}</span>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* Back to Affiliate Portal */}
        <Button
          variant="outline"
          size={collapsed ? "icon" : "default"}
          className="w-full"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span className="ml-2">{t.common.affiliateMode}</span>}
        </Button>
        
        {/* Copyright */}
        <div className={`text-xs text-muted-foreground mt-3 ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "© SL" : "© 2026 SnapLeads Admin"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
