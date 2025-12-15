'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Plus, RefreshCw, X, Check } from 'lucide-react';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { tasks, Task } from '@/lib/data';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskForm } from '@/components/task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const taskIcons = {
  completed: Check,
  pending: Clock,
  overdue: X,
};

function TaskList({ tasks, onTaskCheckedChange }: { tasks: Task[], onTaskCheckedChange: (taskId: string, checked: boolean) => void }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center p-12 text-muted-foreground">
        <CheckSquare className="h-10 w-10" />
        <p className="text-lg font-medium">All clear!</p>
        <p className="text-sm">You have no tasks in this view.</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 rounded-md border p-3">
          <Checkbox
            id={`task-${task.id}`}
            checked={task.status === 'completed'}
            onCheckedChange={(checked) => onTaskCheckedChange(task.id, !!checked)}
          />
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                task.status === 'completed' && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </label>
            <div className="flex items-center gap-2">
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
                {task.linkedEntity && (
                    <Badge variant="secondary">{task.linkedEntity}</Badge>
                )}
            </div>
          </div>
          {task.status !== 'completed' && <Badge variant={task.status === 'overdue' ? 'destructive' : 'outline'}>{task.status}</Badge>}
        </div>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const { user } = useFirebase();
  const isConnected = true; // Mock
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  const [taskList, setTaskList] = React.useState(tasks);

  const handleTaskCheckedChange = (taskId: string, checked: boolean) => {
    setTaskList(currentTasks =>
        currentTasks.map(task =>
            task.id === taskId
            ? { ...task, status: checked ? 'completed' : task.dueDate === 'Yesterday' ? 'overdue' : 'pending' }
            : task
        )
    );
  };
  
  const tasksByStatus = (status: Task['status']) => taskList.filter(t => t.status === status);
  const tasksToday = taskList.filter(t => t.dueDate === 'Today' && t.status !== 'completed');
  const tasksThisWeek = taskList.filter(t => t.dueDate !== 'Last week' && t.status !== 'completed');


  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Connect Google Tasks</h2>
          <p className="max-w-xs text-muted-foreground">
            Sync your to-do lists between your CRM and Google Tasks.
          </p>
          <Button asChild>
            <Link href="/settings/integrations">Connect Google Tasks</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold md:text-3xl">Tasks</h1>
                <p className="text-muted-foreground text-sm">Last synced: Just now</p>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Sync Now</Button>
                <Button onClick={() => setIsNewTaskDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Task</Button>
            </div>
        </div>

        <Tabs defaultValue="my-tasks">
          <TabsList>
            <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="my-tasks">
            <Card>
                <CardHeader><CardTitle>All My Tasks</CardTitle></CardHeader>
                <CardContent>
                    <TaskList tasks={taskList} onTaskCheckedChange={handleTaskCheckedChange} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="today">
            <Card>
                <CardHeader><CardTitle>Tasks for Today</CardTitle></CardHeader>
                <CardContent>
                    <TaskList tasks={tasksToday} onTaskCheckedChange={handleTaskCheckedChange} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue">
            <Card>
                <CardHeader><CardTitle>Overdue Tasks</CardTitle></CardHeader>
                <CardContent>
                    <TaskList tasks={tasksByStatus('overdue')} onTaskCheckedChange={handleTaskCheckedChange} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="this-week">
            <Card>
                <CardHeader><CardTitle>Tasks for This Week</CardTitle></CardHeader>
                <CardContent>
                    <TaskList tasks={tasksThisWeek} onTaskCheckedChange={handleTaskCheckedChange} />
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card>
                <CardHeader><CardTitle>Completed Tasks</CardTitle></CardHeader>
                <CardContent>
                    <TaskList tasks={tasksByStatus('completed')} onTaskCheckedChange={handleTaskCheckedChange} />
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
    </AppShell>
  );
}
