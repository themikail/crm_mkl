'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');

const ORG_ID = 'groupmkl';

export function GoogleIntegration() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'requires_bootstrap' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // 1. Membership Check
  const memberDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, `orgs/${ORG_ID}/members`, user.uid) : null),
    [firestore, user]
  );
  const { data: memberData, isLoading: isMemberLoading } = useDoc(memberDocRef);

  // 2. Integration Data Fetch (only if membership is confirmed)
  const integrationDocRef = useMemoFirebase(
    () => (firestore && user && status === 'ready' ? doc(firestore, 'orgs', ORG_ID, 'integrations', 'google') : null),
    [firestore, user, status]
  );
  const { data: integrationData, isLoading: isIntegrationLoading } = useDoc(integrationDocRef);
  const isIntegrationConnected = integrationData?.connected;

  const handleBootstrap = useCallback(async () => {
    if (!user) return;
    setStatus('loading');
    setError(null);
    try {
      const functions = getFunctions();
      const ensureOrgMembership = httpsCallable(functions, 'ensureOrgMembership');
      const result = await ensureOrgMembership();
      
      const { success, message } = result.data as { success: boolean, message: string};
      
      if (success) {
        setStatus('ready');
      } else {
        setError(message || 'Failed to setup account. Please contact support.');
        setStatus('error');
      }
    } catch (e: any) {
      console.error('Error bootstrapping account:', e);
      setError(e.message || 'An unexpected error occurred during setup.');
      setStatus('error');
      // If setup fails due to domain, sign out
      if (e.message?.includes('invalid-domain')) {
        if(auth) await signOut(auth);
        router.push('/login?error=invalid-domain');
      }
    }
  }, [user, auth, router]);

  useEffect(() => {
    if (isUserLoading || isMemberLoading) {
      setStatus('loading');
      return;
    }
    if (user && !memberData) {
      setStatus('requires_bootstrap');
      handleBootstrap(); // Automatically trigger bootstrap
    } else if (user && memberData) {
      setStatus('ready');
    }
  }, [user, memberData, isUserLoading, isMemberLoading, handleBootstrap]);


  const handleConnect = async () => {
    if (!auth || !firestore || !user) return;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken; // This is the access token
      const refreshToken = credential?.idToken; // You might need server-side flow for a long-lived refresh token

      const integrationDocPayload = {
        connected: true,
        email: result.user.email,
        // WARNING: Storing access tokens client-side is not recommended for production.
        // This should be handled server-side for security.
        accessToken: token,
        refreshToken: refreshToken, // This might be null on re-authentication
        scopes: googleProvider.customParameters,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(firestore, 'orgs', ORG_ID, 'integrations', 'google'), integrationDocPayload, { merge: true });

    } catch (error) {
      console.error('Error connecting Google account:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationDocRef) return;
    try {
      await setDoc(integrationDocRef, { connected: false, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
    }
  };

  const isLoading = status === 'loading' || isIntegrationLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Workspace</CardTitle>
          <CardDescription>
            Sync your Calendar, Email, and Tasks with Synergize CRM.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Loader className="animate-spin" />
          <p>{status === 'requires_bootstrap' ? 'Setting up your account...' : 'Loading...'}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (status === 'error') {
     return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Setup Failed</CardTitle>
                <CardDescription>
                There was a problem setting up your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-destructive-foreground bg-destructive p-3 rounded-md">{error}</p>
                 <Button onClick={() => router.push('/login')} variant="outline" className="mt-4">
                    Go to Login
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Workspace</CardTitle>
        <CardDescription>
          Sync your Calendar, Email, and Tasks with Synergize CRM.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isIntegrationConnected ? (
          <div className="flex flex-col gap-4">
            <p>
              Connected as <span className="font-semibold">{integrationData.email}</span>.
            </p>
            <Button onClick={handleDisconnect} variant="destructive" className="w-fit">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect}>Connect Google Account</Button>
        )}
      </CardContent>
    </Card>
  );
}
