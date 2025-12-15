'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser, useMemoFirebase, useCollection, useDoc } from '@/firebase';
import Link from 'next/link';
import { addDays, format, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, Plus, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { crmEntities } from '@/lib/data';
import type { CalendarEvent } from '@/lib/data';

const eventFormSchema = z.object({
    summary: z.string().min(1, "Summary is required"),
    start: z.string(),
    end: z.string(),
    attendees: z.string(),
    linkedEntity: z.string().optional(),
});

function EventForm({ event, onSave, onCancel, orgId }: { event?: CalendarEvent | null, onSave: (data: any) => void, onCancel: () => void, orgId: string }) {
    const { firestore } = useFirebase();
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            summary: event?.summary || '',
            start: event?.start ? format(new Date(event.start), "yyyy-MM-dd'T'HH:mm") : '',
            end: event?.end ? format(new Date(event.end), "yyyy-MM-dd'T'HH:mm") : '',
            attendees: event?.attendees?.join(', ') || '',
            linkedEntity: (event?.linkedEntityId && event.linkedEntityType) ? `${event.linkedEntityType}/${event.linkedEntityId}` : '',
        }
    });

    const handleSubmit = (values: z.infer<typeof eventFormSchema>) => {
        const attendees = values.attendees.split(',').map(e => e.trim()).filter(e => e);
        const [linkedEntityType, linkedEntityId] = values.linkedEntity?.split('/') || [null, null];
        const eventData = {
            summary: values.summary,
            start: new Date(values.start).toISOString(),
            end: new Date(values.end).toISOString(),
            attendees,
            orgId,
            linkedEntityType,
            linkedEntityId,
        };

        if (event?.id) {
            if (!firestore) return;
            const eventRef = doc(firestore, 'orgs', orgId, 'calendarEvents', event.id);
            setDocumentNonBlocking(eventRef, { ...eventData, updatedAt: serverTimestamp() }, { merge: true });
        } else {
            if (!firestore) return;
            const collectionRef = collection(firestore, 'orgs', orgId, 'calendarEvents');
            addDocumentNonBlocking(collectionRef, { ...eventData, createdAt: serverTimestamp() });
        }
        onSave(eventData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Summary</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                                <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="attendees"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Attendees (comma-separated)</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="linkedEntity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Link to CRM Entity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an entity" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {crmEntities.map(entity => (
                                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <SheetFooter>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Event</Button>
                </SheetFooter>
            </form>
        </Form>
    );
}

export default function CalendarPage() {
  const { firestore, user } = useFirebase();
  const [isSyncing, setIsSyncing] = React.useState(false);
  const orgId = "org-123"; // Hardcoded for now

  const integrationDocRef = useMemoFirebase(() => (firestore && orgId && user ? doc(firestore, `orgs/${orgId}/integrations/google`) : null), [firestore, orgId, user]);
  const { data: integrationData } = useDoc(integrationDocRef);
  const isConnected = integrationData?.connected;

  const eventsCollectionRef = useMemoFirebase(() => (firestore && orgId && user ? collection(firestore, `orgs/${orgId}/calendarEvents`) : null), [firestore, orgId, user]);
  const { data: calendarEvents, isLoading: isLoadingEvents } = useCollection<CalendarEvent>(eventsCollectionRef);

  const [isEventSheetOpen, setIsEventSheetOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
        const functions = getFunctions();
        const syncGoogleCalendarEvents = httpsCallable(functions, 'syncGoogleCalendarEvents');
        await syncGoogleCalendarEvents({ orgId });
    } catch (error) {
        console.error("Error syncing calendar events:", error);
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

  const upcomingEvents = React.useMemo(() => {
    if (!calendarEvents) return [];
    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);
    return calendarEvents.filter(event => {
      if (!event.start) return false;
      return isWithinInterval(new Date(event.start), { start: now, end: twoWeeksFromNow })
    }).sort((a, b) => {
      if (!a.start || !b.start) return 0;
      return new Date(a.start).getTime() - new Date(b.start).getTime()
    });
  }, [calendarEvents]);


  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventSheetOpen(true);
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

  const handleSaveEvent = async (data: any) => {
    console.log("Event saved", data);
    setIsEventSheetOpen(false);
    // Optionally trigger a sync for the specific event
  };

  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Connect your Google Calendar</h2>
          <p className="max-w-xs text-muted-foreground">
            See your upcoming meetings and create new events without leaving the CRM.
          </p>
          <Button asChild>
            <Link href="/settings/integrations">Connect Google Calendar</Link>
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
                <h1 className="text-2xl font-semibold md:text-3xl">Calendar</h1>
                {integrationData?.lastSyncAt && <p className="text-sm text-muted-foreground">Last synced: {format(integrationData.lastSyncAt.toDate(), 'PPpp')}</p>}
            </div>
            <div className="flex gap-2">
                <Button onClick={handleSync} disabled={isSyncing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button onClick={handleCreateEvent}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                </Button>
            </div>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your meetings for the next 14 days.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingEvents ? <p>Loading events...</p> : (
                    <div className="space-y-4">
                        {upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-muted" onClick={() => handleViewEvent(event)}>
                                <div>
                                    <p className="font-semibold">{event.summary}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {event.start && format(new Date(event.start), 'EEE, MMM d, yyyy, h:mm a')}
                                    </p>
                                    {event.linkedEntityId && <p className='text-xs text-primary'>{event.linkedEntityType}/{event.linkedEntityId}</p>}
                                </div>
                                <Button variant="outline" size="sm">View</Button>
                            </div>
                        )) : <p>No upcoming events.</p>}
                    </div>
                )}
            </CardContent>
        </Card>

        <Sheet open={isEventSheetOpen} onOpenChange={setIsEventSheetOpen}>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{selectedEvent ? 'Event Details' : 'Create New Event'}</SheetTitle>
                    <SheetDescription>
                        {selectedEvent ? 'View or edit your event details.' : 'Add a new event to your calendar.'}
                    </SheetDescription>
                </SheetHeader>
                <div className="py-4">
                   <EventForm event={selectedEvent} onSave={handleSaveEvent} onCancel={() => setIsEventSheetOpen(false)} orgId={orgId} />
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
