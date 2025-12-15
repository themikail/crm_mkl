'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { tasks } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TaskForm } from '../task-form';


export function TasksOverview() {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  
  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Your upcoming and overdue tasks.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.status === 'completed'}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={cn(
                      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                      task.status === 'completed' && 'line-through text-muted-foreground'
                    )}
                  >
                    {task.title}
                  </label>
                  <p
                    className={cn(
                      'text-xs',
                      task.status === 'overdue'
                        ? 'text-destructive'
                        : 'text-muted-foreground'
                    )}
                  >
                    {task.dueDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your to-do list. You can also sync it with Google Tasks.
            </DialogDescription>
          </DialogHeader>
          <TaskForm onTaskCreated={() => setIsNewTaskDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
