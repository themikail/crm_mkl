'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Gem, AlertTriangle, Loader } from 'lucide-react';

const googleProvider = new GoogleAuthProvider();
const ALLOWED_DOMAIN = '@groupmkl.com';

export default function LoginPage() {
  const { auth, user, isUserLoading } = useFirebase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'invalid-domain') {
        setError(`Access Denied: Only users with an ${ALLOWED_DOMAIN} email address are allowed.`);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    setError(null);
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      
      if (userEmail && userEmail.endsWith(ALLOWED_DOMAIN)) {
        // The user is valid, let the main page effect handle the redirect
        // The bootstrap flow will be handled on the settings/integrations page
      } else {
        // Invalid domain, sign out immediately
        await signOut(auth);
        setError(`Access Denied: Only users with an ${ALLOWED_DOMAIN} email address are allowed.`);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError('An error occurred during sign-in. Please try again.');
    } finally {
        setIsSigningIn(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Gem className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Synergize CRM</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button 
            className="w-full" 
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                </>
            ) : (
                'Sign In with Google'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
