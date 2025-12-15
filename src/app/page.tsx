'use client';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useFirebase } from '@/firebase';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader className="h-6 w-6 animate-spin" />
            <p className="ml-2">Loading...</p>
        </div>
    );
  }

  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}
