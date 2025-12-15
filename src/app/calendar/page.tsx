'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { calendarEvents, CalendarEvent, crmEntities } from '@/lib/data';
import { addDays, format, isWithinInterval } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
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

const eventFormSchema = z.object({
    summary: z.string().min(1, "Summary is required"),
    start: z.string(),
    end: z.string(),
    attendees: z.string(),
    linkedEntity: z.string().optional(),
});

function EventForm({ event, onSave, onCancel }: { event?: CalendarEvent | null, onSave: () => void, onCancel: () => void }) {
    const form = useForm<z.infer<typeof eventFormSchema>>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            summary: event?.summary || '',
            start: event ? format(event.start, "yyyy-MM-dd'T'HH:mm") : '',
            end: event ? format(event.end, "yyyy-MM-dd'T'HH:mm") : '',
            attendees: event?.attendees.join(', ') || '',
            linkedEntity: event?.linkedEntity || '',
        }
    });

    const handleSubmit = (values: z.infer<typeof eventFormSchema>) => {
        console.log("Saving event:", values);
        onSave();
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
  const { user } = useFirebase(); // Assuming integration status is derived from user or a Firestore doc
  const isConnected = true; // Mock: replace with actual logic
  const [isEventSheetOpen, setIsEventSheetOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);

  const upcomingEvents = calendarEvents.filter(event =>
    isWithinInterval(event.start, {
      start: new Date(),
      end: addDays(new Date(), 14),
    })
  );

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsEventSheetOpen(true);
  };

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

  const handleSaveEvent = () => {
    console.log("Event saved");
    setIsEventSheetOpen(false);
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
          <h1 className="text-2xl font-semibold md:text-3xl">Calendar</h1>
          <Button onClick={handleCreateEvent}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
          </Button>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your meetings for the next 14 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="flex items-center justify-between rounded-md border p-4" onClick={() => handleViewEvent(event)}>
                            <div>
                                <p className="font-semibold">{event.summary}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(event.start, 'EEE, MMM d, yyyy, h:mm a')}
                                </p>
                                {event.linkedEntity && <p className='text-xs text-primary'>{event.linkedEntity}</p>}
                            </div>
                            <Button variant="outline" size="sm">View</Button>
                        </div>
                    ))}
                </div>
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
                   <EventForm event={selectedEvent} onSave={handleSaveEvent} onCancel={() => setIsEventSheetOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
