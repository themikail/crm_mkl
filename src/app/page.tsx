'use client';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  if (isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
            <p className="ml-2">Loading...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold">Welcome to Synergize CRM</h1>
            <p className="max-w-md text-muted-foreground">
              To get started, please sign in with your Google Account. This will allow the CRM to sync with your Google Calendar, Gmail, and Tasks.
            </p>
            <p className="text-sm text-muted-foreground">
              If you don't have an account, one will be created for you when you connect.
            </p>
            <Button asChild>
                <Link href="/settings/integrations">Connect Your Google Account</Link>
            </Button>
            <p className="text-xs text-muted-foreground pt-4">
              Note: The "Google" sign-in provider must be enabled in your Firebase project for this to work.
            </p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
