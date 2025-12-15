"use client";
import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { Header } from './header';
import { CommandMenu } from '../command-menu';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [commandMenuOpen, setCommandMenuOpen] = React.useState(false);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarRail />
      <SidebarInset>
        <Header onSearchClick={() => setCommandMenuOpen(true)} />
        <main className="min-h-0 flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
      <CommandMenu open={commandMenuOpen} setOpen={setCommandMenuOpen} />
    </SidebarProvider>
  );
}
