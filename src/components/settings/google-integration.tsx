'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirebase, useMemoFirebase } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');

export function GoogleIntegration() {
  const { auth, firestore, user, isUserLoading } = useFirebase();
  const orgId = 'org-123'; // Hardcoded for now

  // 1. Membership Check
  const memberDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, `orgs/${orgId}/members`, user.uid) : null),
    [firestore, user]
  );
  const { data: memberData, isLoading: isMemberLoading } = useDoc(memberDocRef);
  const isMember = memberData != null;
  const showBootstrap = !isMember && !isMemberLoading && !!user;

  // 2. Integration Data Fetch (only if membership is confirmed)
  const integrationDocRef = useMemoFirebase(
    () => (firestore && user && isMember ? doc(firestore, 'orgs', orgId, 'integrations', 'google') : null),
    [firestore, user, isMember]
  );
  const { data: integrationData, isLoading: isIntegrationLoading } = useDoc(integrationDocRef);


  const handleConnect = async () => {
    if (!auth || !firestore || !user) return;

    try {
      // Re-authenticate with Google to ensure we have the latest tokens and scopes.
      const result = await signInWithPopup(auth, googleProvider);
      
      const integrationDoc = {
        id: 'google',
        orgId: orgId,
        connected: true,
        scopes: googleProvider.providerId ? [googleProvider.providerId] : [],
        email: result.user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      // This is a non-blocking write for a better UX. The UI will update optimistically.
      await setDoc(doc(firestore, 'orgs', orgId, 'integrations', 'google'), integrationDoc, { merge: true });

    } catch (error) {
      console.error('Error connecting Google account:', error);
    }
  };

  const handleBootstrap = async () => {
    if (!firestore || !user) return;
    const batch = writeBatch(firestore);

    // 1. User Profile
    const userDocRef = doc(firestore, 'users', user.uid);
    batch.set(userDocRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        orgId: orgId, // Associate user with the org
    }, { merge: true });

    // 2. Membership Document
    const newMemberDocRef = doc(firestore, `orgs/${orgId}/members`, user.uid);
    batch.set(newMemberDocRef, {
        role: 'owner', // First user becomes owner
        email: user.email,
        createdAt: serverTimestamp(),
    }, { merge: true });

    await batch.commit();
    // After this, the useDoc for memberData will refetch and unlock the rest of the UI.
  }

  const handleDisconnect = async () => {
    if (!integrationDocRef) return;
    try {
      await setDoc(integrationDocRef, { connected: false, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
    }
  };
  
  const isLoading = isUserLoading || isMemberLoading || (isMember && isIntegrationLoading);

  if (isLoading) {
      return (
          <Card>
            <CardHeader>
              <CardTitle>Google Workspace</CardTitle>
              <CardDescription>
                Sync your Calendar, Email, and Tasks with Synergize CRM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Loading status...</p>
            </CardContent>
          </Card>
        );
  }

  if (!user) {
    return (
       <Card>
          <CardHeader>
            <CardTitle>Google Workspace</CardTitle>
            <CardDescription>
              Please sign in to connect your Google Workspace account.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={handleConnect}>Sign In with Google</Button>
          </CardContent>
        </Card>
    )
  }

  if(showBootstrap) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Finalize Account Setup</CardTitle>
                <CardDescription>
                You're signed in but not yet a member of an organization. Click below to complete your account setup.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleBootstrap}>Setup Account & Join Organization</Button>
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
        {integrationData && integrationData.connected ? (
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