"use client"

import Link from "next/link"
import { Activity, Calendar, Droplets, Heart, Home, Moon, Scale, Timer, Utensils } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar"
import { ModeToggle } from "~/components/mode-toggle"
import { UserNav } from "~/components/user-nav"
import { usePathname } from "next/navigation"

const sideMenu = [
  { id: 1, icon: Home, name: 'Dashboard', link: '/' },
  { id: 2, icon: Heart, name: 'Mood Tracker', link: '/mood' },
  { id: 3, icon: Droplets, name: 'Water Intake', link: '/water' },
  { id: 4, icon: Timer, name: 'Breathing Exercise', link: '/breathing' },
  { id: 5, icon: Utensils, name: 'Meal Log', link: '/meal' },
  { id: 6, icon: Moon, name: 'Sleep Tracker', link: '/sleep' },
  { id: 7, icon: Activity, name: 'Fitness Routine', link: '/fitness' },
  { id: 8, icon: Timer, name: 'Stretch Sequence', link: '/stretch' },
  { id: 9, icon: Calendar, name: 'Mental Health Journal', link: '/mental' },
  { id: 10, icon: Scale, name: 'Weight Tracker', link: '/weight' },
];

export default function Page({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = sideMenu.find(item => item.link === pathname);
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger />
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-xl font-semibold">{title?.name || 'Dashboard'}</h1>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold size-full">
          <span>Wellness</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sideMenu.map(item => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild isActive={pathname === item.link} onClick={() => setOpenMobile(false)}>
                    <Link href={item.link}>
                      <item.icon className="size-4" />
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">© 2025 Wellness</p>
      </SidebarFooter>
    </Sidebar>
  )
}
