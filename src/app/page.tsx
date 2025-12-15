'use client';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/components/dashboard/dashboard';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, auth } = useFirebase();

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-bold">Welcome to Synergize CRM</h1>
            <p>Please sign in to continue</p>
            <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
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
