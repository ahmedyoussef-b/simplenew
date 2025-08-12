// src/components/auth/SocialSignInButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { auth, googleProvider } from '@/lib/firebase';
import { useSocialLoginMutation } from '@/lib/redux/api/authApi';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" {...props}>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.9 2.04-5.07 2.04-4.35 0-7.88-3.58-7.88-7.99s3.53-7.99 7.88-7.99c2.27 0 4.1.84 5.42 2.08l2.6-2.6C18.4 2.1 15.82 1 12.48 1 5.83 1 1 5.83 1 12.5s4.83 11.5 11.48 11.5c6.5 0 11.23-4.56 11.23-11.34 0-.74-.07-1.44-.2-2.14H12.48z"
      fill="currentColor"
    />
  </svg>
);

export default function SocialSignInButtons() {
  const [socialLogin, { isLoading }] = useSocialLoginMutation();
  const { toast } = useToast();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Get the ID token from the signed-in user
      const idToken = await result.user.getIdToken();
      
      // Send the ID token to your backend for verification and session creation
      await socialLogin({ idToken }).unwrap();
      
      toast({ title: 'Sign-in Successful', description: 'Welcome!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      // Handle Firebase specific errors (e.g., popup closed)
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Sign-in Failed',
        description: error.data?.message || 'Could not sign in with Google.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </div>
  );
}
