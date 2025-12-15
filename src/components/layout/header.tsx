"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface HeaderProps {
    onSearchClick: () => void;
}

export function Header({ onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="relative flex-1">
        <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground shadow-none"
            onClick={onSearchClick}
        >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline-block">Search or type a command...</span>
            <span className="inline-block lg:hidden">Search...</span>
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
      </div>
    </header>
  );
}
