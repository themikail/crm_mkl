"use client"

import * as React from "react"
import type { DialogProps } from "@radix-ui/react-dialog"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// We are not using cmdk to avoid adding new dependencies. This is a simplified implementation.

type CommandContextValue = {
  searchTerm: string;
}

const CommandContext = React.createContext<CommandContextValue | undefined>(undefined);

const useCommand = () => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("useCommand must be used within a Command");
  }
  return context;
}

const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredChildren = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === CommandList) {
        const listChildren = React.Children.map(child.props.children, (group) => {
          if (React.isValidElement(group) && group.type === CommandGroup) {
            const groupChildren = React.Children.map(group.props.children, (item) => {
              if (React.isValidElement(item) && item.type === CommandItem) {
                const itemText = (item.props.children as React.ReactNode)?.toString().toLowerCase() || '';
                const itemValue = (item.props.value || '').toLowerCase();
                if (itemText.includes(searchTerm.toLowerCase()) || itemValue.includes(searchTerm.toLowerCase())) {
                  return item;
                }
                return null;
              }
              return item;
            });
            return React.cloneElement(group, {}, groupChildren);
          }
          return group;
        });
        return React.cloneElement(child, {}, listChildren);
      }
      if(React.isValidElement(child) && child.type === CommandInput) {
        return React.cloneElement(child, { value: searchTerm, onValueChange: setSearchTerm });
      }
      return child;
    });
  }, [children, searchTerm]);


  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    >
      <CommandContext.Provider value={{ searchTerm }}>
        {filteredChildren}
      </CommandContext.Provider>
    </div>
  )
})
Command.displayName = "Command"

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, 'value' | 'onChange'> & { onValueChange: (value: string) => void, value: string }
>(({ className, onValueChange, ...props }, ref) => (
  <div className="flex items-center border-b px-3">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <input
      ref={ref}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))

CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { searchTerm } = useCommand();
  if (searchTerm.length === 0) return null;

  return (
    <div ref={ref} className="py-6 text-center text-sm" {...props}>
      No results found.
    </div>
  )
});

CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { heading?: string }
>(({ className, heading, children, ...props }, ref) => {
  const hasVisibleItems = React.Children.toArray(children).some(child => child !== null);

  if (!hasVisibleItems) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground",
        className
      )}
      {...props}
    >
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}
      {children}
    </div>
  )
})

CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

const CommandItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))

CommandItem.displayName = "CommandItem"

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
