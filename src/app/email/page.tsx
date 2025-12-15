'use client';

import * as React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { useFirebase, useUser, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { Mails, Send, Paperclip, Trash2, RefreshCw } from 'lucide-react';
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
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useCollection, useDoc } from '@/firebase/firestore/use-collection';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Email } from '@/lib/data';
import { format } from 'date-fns';

const emailFormSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Body is required"),
});


export default function EmailPage() {
    const { firestore, user } = useFirebase();
    const [isSyncing, setIsSyncing] = React.useState(false);
    const orgId = "org-123"; // Hardcoded for now

    const integrationDocRef = useMemoFirebase(() => (firestore && orgId ? doc(firestore, `orgs/${orgId}/integrations/google`) : null), [firestore, orgId]);
    const { data: integrationData } = useDoc(integrationDocRef);
    const isConnected = integrationData?.connected;

    const emailsCollectionRef = useMemoFirebase(() => (firestore && orgId ? collection(firestore, `orgs/${orgId}/emails`) : null), [firestore, orgId]);
    const { data: emails, isLoading: isLoadingEmails } = useCollection(emailsCollectionRef);

    const [selectedEmail, setSelectedEmail] = React.useState<Email | null>(null);
    const [isComposeOpen, setIsComposeOpen] = React.useState(false);

    const form = useForm<z.infer<typeof emailFormSchema>>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: { to: '', subject: '', body: '' },
    });

    const handleSync = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const functions = getFunctions();
            const syncGmailMessages = httpsCallable(functions, 'syncGmailMessages');
            await syncGmailMessages({ orgId });
            toast({ title: 'Success', description: 'Emails synced successfully.'});
        } catch (error) {
            console.error("Error syncing emails:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not sync emails.' });
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

    React.useEffect(() => {
        if (emails && emails.length > 0 && !selectedEmail) {
            setSelectedEmail(emails[0]);
        }
    }, [emails, selectedEmail]);

    const handleSendEmail = (values: z.infer<typeof emailFormSchema>) => {
        console.log('Sending email:', values);
        toast({ title: 'Email Sent!', description: 'Your email has been sent successfully.' });
        setIsComposeOpen(false);
        form.reset();
    };

    const handleLogToCrm = (email: Email) => {
      if (!firestore) return;
      const activityRef = collection(firestore, 'orgs', orgId, 'activities');
      setDocumentNonBlocking(doc(activityRef), {
          orgId,
          activityType: 'Email',
          relatedEntityType: email.linkedEntityType || 'contact', // default to contact
          relatedEntityId: email.linkedEntityId,
          timestamp: new Date(email.date),
          subject: `Email: ${email.subject}`,
          notes: email.snippet,
      }, { merge: true });
      toast({ title: 'Logged to CRM', description: 'Email activity has been logged.' });
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
                <div>
                    <h1 className="text-2xl font-semibold md:text-3xl">Email</h1>
                    {integrationData?.lastSyncAt && <p className="text-sm text-muted-foreground">Last synced: {format(integrationData.lastSyncAt.toDate(), 'PPpp')}</p>}
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSync} disabled={isSyncing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button onClick={() => setIsComposeOpen(true)}>
                        <Send className="mr-2 h-4 w-4" /> Compose
                    </Button>
                </div>
            </div>
            <div className="grid h-[calc(100vh-150px)] grid-cols-1 md:grid-cols-3">
                <div className="md:col-span-1 overflow-y-auto border-r">
                    {isLoadingEmails ? <p className="p-4">Loading emails...</p> : (
                        <ul>
                            {emails && emails.map(email => (
                                <li key={email.id} className={cn("p-4 border-b cursor-pointer hover:bg-muted", selectedEmail?.id === email.id && "bg-muted")} onClick={() => setSelectedEmail(email)}>
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate">{email.from}</p>
                                        <time className="text-xs text-muted-foreground whitespace-nowrap ml-2">{format(new Date(email.date), 'PP p')}</time>
                                    </div>
                                    <p className="text-sm font-bold">{email.subject}</p>
                                    <p className="text-sm text-muted-foreground truncate">{email.snippet}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="md:col-span-2 overflow-y-auto">
                    {selectedEmail ? (
                         <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                 <div>
                                     <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                                     <p className="text-sm text-muted-foreground">From: {selectedEmail.from}</p>
                                     <p className="text-sm text-muted-foreground">To: {selectedEmail.to}</p>
                                 </div>
                                 <Button variant="outline" onClick={() => handleLogToCrm(selectedEmail)}>Log to CRM</Button>
                            </div>
                             <Separator />
                             <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.snippet || '' }}>
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
