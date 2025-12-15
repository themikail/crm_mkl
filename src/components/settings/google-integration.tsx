'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, useFirebase, useMemoFirebase } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  OAuthCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useDoc } from '@/firebase/firestore/use-doc';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');

export function GoogleIntegration() {
  const { firestore, user } = useFirebase();
  const auth = useAuth();
  const orgId = 'org-123'; // Hardcoded for now

  const integrationDocRef = useMemoFirebase(
    () => (firestore && orgId && user ? doc(firestore, 'orgs', orgId, 'integrations', 'google') : null),
    [firestore, orgId, user]
  );
  
  const { data: integrationData, isLoading } = useDoc(integrationDocRef);

  const handleConnect = async () => {
    if (!auth || !firestore || !orgId) return;

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        const { user } = result;

        // 1. Create or update the user's profile document
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocData = {
          id: user.uid,
          orgId: orgId,
          email: user.email,
          displayName: user.displayName,
          role: 'Owner', // Assign a default role
        };
        // Use non-blocking write for the user profile
        setDocumentNonBlocking(userDocRef, userDocData, { merge: true });
        
        // 2. Create the integration document
        const integrationDoc = {
          id: 'google',
          orgId: orgId,
          connected: true,
          scopes: googleProvider.providerId ? [googleProvider.providerId] : [],
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        if (integrationDocRef) {
          setDocumentNonBlocking(integrationDocRef, integrationDoc, { merge: true });
        }
      }
    } catch (error) {
      console.error('Error connecting Google account:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!integrationDocRef) return;
    try {
        setDocumentNonBlocking(integrationDocRef, { connected: false, updatedAt: serverTimestamp() }, { merge: true });
      // We don't sign out the user from Firebase, just mark as disconnected.
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
    }
  };
  
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
              <p>Loading integration status...</p>
            </CardContent>
          </Card>
        );
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
