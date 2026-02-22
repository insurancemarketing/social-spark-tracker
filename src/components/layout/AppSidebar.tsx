import {
  LayoutDashboard,
  FileText,
  Youtube,
  Music2,
  Instagram,
  Facebook,
  Settings,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Content Tracker", url: "/content", icon: FileText },
];

const platformItems = [
  { title: "YouTube", url: "/youtube", icon: Youtube },
  { title: "TikTok", url: "/tiktok", icon: Music2 },
  { title: "Instagram", url: "/instagram", icon: Instagram },
  { title: "Facebook", url: "/facebook", icon: Facebook },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

function NavGroup({ label, items }: { label: string; items: typeof mainItems }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">
          📊 Analytics
        </h1>
      </div>
      <SidebarContent>
        <NavGroup label="Overview" items={mainItems} />
        <NavGroup label="Platforms" items={platformItems} />
        <NavGroup label="Config" items={settingsItems} />
      </SidebarContent>
    </Sidebar>
  );
}
