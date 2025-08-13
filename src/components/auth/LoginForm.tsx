// src/components/auth/LoginForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import FormError from '@/components/forms/FormError';
import { loginSchema, type LoginSchema as LoginFormValues } from '@/lib/formValidationSchemas';
import SocialSignInButtons from './SocialSignInButtons';


export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [login, { isLoading, isSuccess, isError, data: loginSuccessData, error: loginErrorData }] = useLoginMutation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isSuccess && loginSuccessData) {
        toast({
          title: "Connexion réussie!",
          description: "Vous allez être redirigé vers votre tableau de bord."
        });
        window.location.href = '/dashboard';
    }
    if (isError) {
      const apiError = loginErrorData as any;
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: apiError?.data?.message || "Veuillez vérifier vos identifiants."
      });
    }
  }, [isSuccess, isError, loginSuccessData, loginErrorData, router, toast]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    await login(data);
  };

  return (
    <div className="space-y-6">
       <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="unopaq">
          <feTurbulence type="fractalNoise" baseFrequency="0.5 1.5" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1" result="diffuse">
            <feDistantLight azimuth="0" elevation="25" />
          </feDiffuseLighting>
        </filter>
        <filter id="unopaq2">
          <feTurbulence type="fractalNoise" baseFrequency="0.2 1.5" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1" result="diffuse">
            <feDistantLight azimuth="0" elevation="25" />
          </feDiffuseLighting>
        </filter>
        <filter id="unopaq3">
          <feTurbulence type="fractalNoise" baseFrequency="0.1 0.5" numOctaves="2" stitchTiles="stitch" result="noise" />
          <feDiffuseLighting in="noise" lightingColor="#fff" surfaceScale="1" result="diffuse">
            <feDistantLight azimuth="0" elevation="25" />
          </feDiffuseLighting>
        </filter>
      </svg>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="neumorphic-container">
          <input
            id="email"
            type="text"
            required
            autoComplete="email"
            placeholder=" " 
            {...register('email')}
            disabled={isLoading}
            className="neumorphic-input"
          />
           <label htmlFor="email" className="neumorphic-label">Email ou nom d'utilisateur</label>
        </div>
        <FormError error={errors.email} className="pl-4" />
        
        <div className="neumorphic-container">
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder=" "
            {...register('password')}
            disabled={isLoading}
            className="neumorphic-input"
          />
          <label htmlFor="password" className="neumorphic-label">Mot de passe</label>
        </div>
        <FormError error={errors.password} className="pl-4"/>
        
        <div className="text-right">
             <Link href="/forgot-password" passHref>
                  <span className="text-xs text-blue-500 hover:underline">Mot de passe oublié ?</span>
              </Link>
        </div>

        <div className="btn">
            <div className="button-container">
                <button type="submit" disabled={isLoading} className="real-button"></button>
                <div className="button-body">
                    <div className="backdrop"></div>
                    <div className="spin spin-blur"></div>
                    <div className="spin spin-intense"></div>
                    <div className="spin spin-inside"></div>
                    <span>{isLoading ? 'Chargement...' : 'Se Connecter'}</span>
                </div>
            </div>
            <div className="button-container">
                <Link href="/register" passHref legacyBehavior>
                    <a className="real-button"></a>
                </Link>
                <div className="button-body">
                    <div className="backdrop"></div>
                    <div className="spin spin-blur"></div>
                    <div className="spin spin-intense"></div>
                    <div className="spin spin-inside"></div>
                    <span>Inscrivez-vous</span>
                </div>
            </div>
        </div>
      </form>
      <SocialSignInButtons />
    </div>
  );
}