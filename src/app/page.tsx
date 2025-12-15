'use client';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useFirebase } from '@/firebase';

export default function Home() {
  const { user, isUserLoading } = useFirebase();

  if (isUserLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">Welcome to Synergize CRM</h1>
            <p>Please sign in to continue.</p>
            {/* The sign-in method should be configured in your Firebase project */}
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
