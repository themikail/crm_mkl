'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Plus, RefreshCw, X } from 'lucide-react';
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
            onCheckedChange={(checked) =&gt; onTaskCheckedChange(task.id, !!checked)}
          />
          <div className="flex-1">
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                task.status === 'completed' &amp;&amp; 'line-through text-muted-foreground'
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
                {task.linkedEntity &amp;&amp; (
                    &lt;Badge variant="secondary"&gt;{task.linkedEntity}&lt;/Badge&gt;
                )}
            </div>
          </div>
          {task.status !== 'completed' &amp;&amp; &lt;Badge variant={task.status === 'overdue' ? 'destructive' : 'outline'}&gt;{task.status}&lt;/Badge&gt;}
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

  const handleTaskCheckedChange = (taskId: string, checked: boolean) =&gt; {
    setTaskList(currentTasks =&gt;
        currentTasks.map(task =&gt;
            task.id === taskId
            ? { ...task, status: checked ? 'completed' : task.dueDate === 'Yesterday' ? 'overdue' : 'pending' }
            : task
        )
    );
  };
  
  const tasksByStatus = (status: Task['status']) =&gt; taskList.filter(t =&gt; t.status === status);
  const tasksToday = taskList.filter(t =&gt; t.dueDate === 'Today' &amp;&amp; t.status !== 'completed');
  const tasksThisWeek = taskList.filter(t =&gt; t.dueDate !== 'Last week' &amp;&amp; t.status !== 'completed');


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
                &lt;Button variant="outline"&gt;&lt;RefreshCw className="mr-2 h-4 w-4" /&gt; Sync Now&lt;/Button&gt;
                <Button onClick={() =&gt; setIsNewTaskDialogOpen(true)}>&lt;Plus className="mr-2 h-4 w-4" /&gt; New Task&lt;/Button&gt;
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
                <CardHeader&gt;&lt;CardTitle&gt;All My Tasks&lt;/CardTitle&gt;&lt;/CardHeader&gt;
                &lt;CardContent&gt;
                    &lt;TaskList tasks={taskList} onTaskCheckedChange={handleTaskCheckedChange} /&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/TabsContent&gt;
          &lt;TabsContent value="today"&gt;
            &lt;Card&gt;
                &lt;CardHeader&gt;&lt;CardTitle&gt;Tasks for Today&lt;/CardTitle&gt;&lt;/CardHeader&gt;
                &lt;CardContent&gt;
                    &lt;TaskList tasks={tasksToday} onTaskCheckedChange={handleTaskCheckedChange} /&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/TabsContent&gt;
          &lt;TabsContent value="overdue"&gt;
            &lt;Card&gt;
                &lt;CardHeader&gt;&lt;CardTitle&gt;Overdue Tasks&lt;/CardTitle&gt;&lt;/CardHeader&gt;
                &lt;CardContent&gt;
                    &lt;TaskList tasks={tasksByStatus('overdue')} onTaskCheckedChange={handleTaskCheckedChange} /&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/TabsContent&gt;
          &lt;TabsContent value="this-week"&gt;
            &lt;Card&gt;
                &lt;CardHeader&gt;&lt;CardTitle&gt;Tasks for This Week&lt;/CardTitle&gt;&lt;/CardHeader&gt;
                &lt;CardContent&gt;
                    &lt;TaskList tasks={tasksThisWeek} onTaskCheckedChange={handleTaskCheckedChange} /&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/TabsContent&gt;
          &lt;TabsContent value="completed"&gt;
            &lt;Card&gt;
                &lt;CardHeader&gt;&lt;CardTitle&gt;Completed Tasks&lt;/CardTitle&gt;&lt;/CardHeader&gt;
                &lt;CardContent&gt;
                    &lt;TaskList tasks={tasksByStatus('completed')} onTaskCheckedChange={handleTaskCheckedChange} /&gt;
                &lt;/CardContent&gt;
            &lt;/Card&gt;
          &lt;/TabsContent&gt;
        &lt;/Tabs&gt;
      &lt;/div&gt;

      &lt;Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}&gt;
        &lt;DialogContent className="sm:max-w-[425px]"&gt;
          &lt;DialogHeader&gt;
            &lt;DialogTitle&gt;Create New Task&lt;/DialogTitle&gt;
            &lt;DialogDescription&gt;
              Add a new task to your to-do list. You can also sync it with Google Tasks.
            &lt;/DialogDescription&gt;
          &lt;/DialogHeader&gt;
          &lt;TaskForm onTaskCreated={() =&gt; setIsNewTaskDialogOpen(false)} /&gt;
        &lt;/DialogContent&gt;
      &lt;/Dialog&gt;
    &lt;/AppShell&gt;
  );
}
