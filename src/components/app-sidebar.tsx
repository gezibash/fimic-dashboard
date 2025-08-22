'use client';

import { useUser } from '@clerk/nextjs';
import { Command, FileText, Settings2, Users } from 'lucide-react';
import Link from 'next/link';
import type * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navMainItems = [
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: Users,
  },
  {
    title: 'Files',
    url: '/files',
    icon: FileText,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUser();

  const userData = {
    name: user?.fullName || 'User',
    email: user?.primaryEmailAddress?.emailAddress || 'user@example.com',
    avatar: user?.imageUrl || '',
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Fimic</span>
                  <span className="truncate text-xs">Tax Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
        <NavSecondary className="mt-auto" items={[]} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
