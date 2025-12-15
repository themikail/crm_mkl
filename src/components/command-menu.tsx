"use client";

import * as React from "react";
import {
  Building2,
  CheckSquare,
  Handshake,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Sun,
  Users,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function CommandMenu({ open, setOpen }: Props) {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Deal</span>
          </CommandItem>
          <CommandItem>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create New Contact</span>
          </CommandItem>
          <CommandItem>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Create New Task</span>
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigation">
          <CommandItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem>
            <Handshake className="mr-2 h-4 w-4" />
            <span>Deals</span>
          </CommandItem>
          <CommandItem>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Companies</span>
          </CommandItem>
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <span>Contacts</span>
          </CommandItem>
          <CommandItem>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
