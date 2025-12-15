'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Plus, RefreshCw, X, Check } from 'lucide-react';
import { useFirebase, useUser, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import Link from 'next/link';
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
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Task } from '@/lib/data';
import { format, isAfter, isBefore, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { useToast } from '@/hooks/use-toast';


const taskIcons = {
  completed: Check,
  pending: Clock,
  overdue: X,
};

function getTaskStatus(task: Task): 'completed' | 'pending' | 'overdue' {
    if (task.status === 'completed') return 'completed';
    if (task.due && isAfter(new Date(), new Date(task.due))) {
        return 'overdue';
    }
    return 'pending';
}

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
      {tasks.map((task) => {
        const status = getTaskStatus(task);
        return (
            <div key={task.id} className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox
                id={`task-${task.id}`}
                checked={status === 'completed'}
                onCheckedChange={(checked) => onTaskCheckedChange(task.id, !!checked)}
            />
            <div className="flex-1">
                <label
                htmlFor={`task-${task.id}`}
                className={cn(
                    'font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    status === 'completed' && 'line-through text-muted-foreground'
                )}
                >
                {task.title}
                </label>
                <div className="flex items-center gap-2">
                    {task.due && (
                        <p className={cn('text-xs', status === 'overdue' ? 'text-destructive' : 'text-muted-foreground')}>
                            {format(new Date(task.due), 'PP')}
                        </p>
                    )}
                    {task.linkedEntity && (
                        <Badge variant="secondary">{task.linkedEntity}</Badge>
                    )}
                </div>
            </div>
            {status !== 'completed' && <Badge variant={status === 'overdue' ? 'destructive' : 'outline'}>{status}</Badge>}
            </div>
        );
    })}
    </div>
  );
}

export default function TasksPage() {
  const { firestore, user } = useFirebase();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const orgId = "org-123"; // Hardcoded for now
  const { toast } = useToast();
  
  const integrationDocRef = useMemoFirebase(() => (firestore && orgId && user ? doc(firestore, `orgs/${orgId}/integrations/google`) : null), [firestore, orgId, user]);
  const { data: integrationData } = useDoc(integrationDocRef);
  const isConnected = integrationData?.connected;

  const tasksCollectionRef = useMemoFirebase(() => (firestore && orgId && user ? collection(firestore, `orgs/${orgId}/tasks`) : null), [firestore, orgId, user]);
  const { data: taskList, isLoading: isLoadingTasks } = useCollection<Task>(tasksCollectionRef);

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  
  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
        const functions = getFunctions();
        const syncGoogleTasks = httpsCallable(functions, 'syncGoogleTasks');
        await syncGoogleTasks({ orgId });
        toast({ title: 'Success', description: 'Tasks synced successfully.'});
    } catch (error) {
        console.error("Error syncing tasks:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not sync tasks.' });
    } finally {
        setIsSyncing(false);
    }
  };

  React.useEffect(() => {
    if (isConnected && user) {
        handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, user]);

  const handleTaskCheckedChange = (taskId: string, checked: boolean) => {
    if (!firestore || !user) return;
    const taskRef = doc(firestore, `orgs/${orgId}/tasks/${taskId}`);
    const status = checked ? 'completed' : 'needsAction';
    setDocumentNonBlocking(taskRef, { status, completedAt: checked ? serverTimestamp() : null }, { merge: true });
  };
  
  const sortedTasks = React.useMemo(() => taskList ? [...taskList].sort((a,b) => (a.due && b.due) ? new Date(a.due).getTime() - new Date(b.due).getTime() : 0) : [], [taskList]);

  const tasksByStatus = (status: 'completed' | 'pending' | 'overdue') => sortedTasks.filter(t => getTaskStatus(t) === status);
  const tasksToday = sortedTasks.filter(t => t.due && isToday(new Date(t.due)) && getTaskStatus(t) !== 'completed');
  const tasksThisWeek = sortedTasks.filter(t => {
      if(!t.due) return false;
      const dueDate = new Date(t.due);
      const now = new Date();
      return isAfter(dueDate, startOfWeek(now)) && isBefore(dueDate, endOfWeek(now)) && getTaskStatus(t) !== 'completed';
  });

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
                {integrationData?.lastSyncAt && <p className="text-muted-foreground text-sm">Last synced: {format(integrationData.lastSyncAt.toDate(), 'PPpp')}</p>}
            </div>
            <div className="flex gap-2">
                <Button onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
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
                    {isLoadingTasks ? <p>Loading...</p> : <TaskList tasks={sortedTasks} onTaskCheckedChange={handleTaskCheckedChange} />}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="today">
            <Card>
                <CardHeader><CardTitle>Tasks for Today</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingTasks ? <p>Loading...</p> : <TaskList tasks={tasksToday} onTaskCheckedChange={handleTaskCheckedChange} />}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="overdue">
            <Card>
                <CardHeader><CardTitle>Overdue Tasks</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingTasks ? <p>Loading...</p> : <TaskList tasks={tasksByStatus('overdue')} onTaskCheckedChange={handleTaskCheckedChange} />}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="this-week">
            <Card>
                <CardHeader><CardTitle>Tasks for This Week</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingTasks ? <p>Loading...</p> : <TaskList tasks={tasksThisWeek} onTaskCheckedChange={handleTaskCheckedChange} />}
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="completed">
            <Card>
                <CardHeader><CardTitle>Completed Tasks</CardTitle></CardHeader>
                <CardContent>
                    {isLoadingTasks ? <p>Loading...</p> : <TaskList tasks={tasksByStatus('completed')} onTaskCheckedChange={handleTaskCheckedChange} />}
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
