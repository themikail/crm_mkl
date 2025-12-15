'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useFirebase } from '@/firebase';
import Link from 'next/link';
import { Mails, Send, Paperclip, Trash2 } from 'lucide-react';
import { emails, Email, crmEntities } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from '@/components/ui/dialog';
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';

const emailFormSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
});


export default function EmailPage() {
  const { user } = useFirebase(); // Assuming integration status is derived from user or a Firestore doc
  const isConnected = true; // Mock: replace with actual logic
  const [selectedEmail, setSelectedEmail] = React.useState<Email | null>(emails[0]);
  const [isComposeOpen, setIsComposeOpen] = React.useState(false);

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: { to: '', subject: '', body: '' },
  });

  const handleSendEmail = (values: z.infer<typeof emailFormSchema>) => {
    console.log('Sending email:', values);
    toast({ title: 'Email Sent!', description: 'Your email has been sent successfully.' });
    setIsComposeOpen(false);
    form.reset();
  };

  if (!isConnected) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Mails className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Connect your Gmail account</h2>
          <p className="max-w-xs text-muted-foreground">
            Sync your emails, send messages, and log conversations without leaving the CRM.
          </p>
          <Button asChild>
            <Link href="/settings/integrations">Connect Gmail</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-2xl font-semibold md:text-3xl">Email</h1>
                <Button onClick={() => setIsComposeOpen(true)}>
                    <Send className="mr-2 h-4 w-4" /> Compose
                </Button>
            </div>
            <div className="grid h-[calc(100vh-150px)] grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1 overflow-y-auto border-r">
                    <ul>
                        {emails.map(email => (
                             <li key={email.id} className={cn("p-4 border-b cursor-pointer hover:bg-muted", selectedEmail?.id === email.id && "bg-muted")} onClick={() => setSelectedEmail(email)}>
                                <div className="flex justify-between items-center">
                                    <p className={cn("font-semibold", !email.isRead && "font-bold")}>{email.from}</p>
                                    <time className="text-xs text-muted-foreground">{email.date}</time>
                                </div>
                                <p className={cn("text-sm", !email.isRead && "font-bold")}>{email.subject}</p>
                                <p className="text-sm text-muted-foreground truncate">{email.snippet}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2 overflow-y-auto">
                    {selectedEmail ? (
                         <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                 <div>
                                     <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                                     <p className="text-sm text-muted-foreground">From: {selectedEmail.from}</p>
                                 </div>
                                 <Button variant="outline">Log to CRM</Button>
                            </div>
                             <Separator />
                             <div className="text-sm prose prose-sm max-w-none">
                                <p>{selectedEmail.snippet}</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                                <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                             </div>
                         </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <p>Select an email to read</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSendEmail)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="to"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>To</FormLabel>
                                    <FormControl><Input placeholder="recipient@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl><Input placeholder="Email subject" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Body</FormLabel>
                                    <FormControl><Textarea placeholder="Write your message..." className="min-h-[200px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter className="flex justify-between w-full">
                            <div>
                                <Button type="button" variant="ghost" size="icon"><Paperclip /></Button>
                            </div>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsComposeOpen(false)}><Trash2 className="mr-2 h-4 w-4" /> Discard</Button>
                                <Button type="submit"><Send className="mr-2 h-4 w-4" /> Send</Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    </AppShell>
  );
}
