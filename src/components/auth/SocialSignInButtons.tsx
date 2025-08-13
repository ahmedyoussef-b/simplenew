// src/components/auth/SocialSignInButtons.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useSocialLoginMutation } from '@/lib/redux/api/authApi';
import { initializeFirebaseApp } from '@/lib/firebase';
import { FaGoogle } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

export default function SocialSignInButtons() {
    const { toast } = useToast();
    const [socialLogin, { isLoading }] = useSocialLoginMutation();

    const handleGoogleSignIn = async () => {
        try {
            const app = initializeFirebaseApp();
            const auth = getAuth(app);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            await socialLogin({ idToken }).unwrap();
            
            // The redirection logic will be handled by the parent component or page
            // based on the updated Redux state.
            toast({ title: "Connexion réussie", description: "Bienvenue !" });

        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            const errorMessage = error.data?.message || "La connexion via Google a échoué. Veuillez réessayer.";
            toast({
                variant: 'destructive',
                title: 'Erreur de connexion',
                description: errorMessage,
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ou continuez avec
                    </span>
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <FaGoogle className="mr-2 h-4 w-4" />
                )}
                Google
            </Button>
        </div>
    );
}
