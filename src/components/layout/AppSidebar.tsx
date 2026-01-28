import { LayoutDashboard, Users, Wallet, Settings, TrendingUp, FileText, FolderOpen, HelpCircle, LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PartnerStatusWidget } from "@/components/sidebar/PartnerStatusWidget";
import { Badge } from "@/components/ui/badge";
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

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { t } = useLanguage();
  const { profile } = useAuth();

  const navItems: NavItem[] = [
    { title: t.nav.dashboard, url: "/", icon: LayoutDashboard },
    { title: t.nav.myLeads, url: "/leads", icon: Users },
    { title: t.nav.payouts, url: "/payouts", icon: Wallet },
    { title: t.nav.commissions, url: "/commissions", icon: TrendingUp },
    { title: t.nav.reports, url: "/reports", icon: FileText },
    { title: t.nav.documents, url: "/documents", icon: FolderOpen, disabled: true },
    { title: t.nav.support, url: "/support", icon: HelpCircle },
    { title: t.nav.settings, url: "/settings", icon: Settings },
  ];
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        {/* Partner Status Widget */}
        {!collapsed && (
          <div className="mb-4">
            <PartnerStatusWidget collapsed={collapsed} />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild={!item.disabled}
                    isActive={!item.disabled && isActive(item.url)}
                    tooltip={collapsed ? (item.disabled ? `${item.title} (${t.common.comingSoon})` : item.title) : undefined}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground/50 cursor-not-allowed">
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <span className="flex items-center gap-2">
                            {item.title}
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              {t.common.comingSoon}
                            </Badge>
                          </span>
                        )}
                      </div>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* User Profile Section */}
        <div className={`flex items-center gap-3 mb-3 ${collapsed ? "justify-center" : ""}`}>
          <Avatar className="h-8 w-8 border border-border shrink-0">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.full_name || "User"}
            </span>
          )}
        </div>
        
        {/* Copyright */}
        <div className={`text-xs text-muted-foreground ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "© SL" : "© 2026 SnapLeads Portal de Afiliados"}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
