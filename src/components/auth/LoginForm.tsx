// src/components/auth/LoginForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Key, Mail } from 'lucide-react';
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <Mail className="input-icon" />
          <input
            type="text"
            placeholder="Email ou nom d'utilisateur"
            autoComplete="email"
            {...register('email')}
            disabled={isLoading}
            className="input-field"
          />
        </div>
        <FormError error={errors.email} className="pl-4" />
        
        <div className="field">
           <Key className="input-icon" />
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            {...register('password')}
            disabled={isLoading}
            className="input-field"
          />
        </div>
        <FormError error={errors.password} className="pl-4"/>
        <div className="text-right">
             <Link href="/forgot-password" passHref legacyBehavior>
                  <a className="text-xs text-blue-500 hover:underline">Mot de passe oublié ?</a>
              </Link>
        </div>

        <div className="btn">
          <button type="submit" className="button1" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Se Connecter
          </button>
           <Link href="/register" className="button2">
              Inscrivez-vous
          </Link>
        </div>
      </form>
      <SocialSignInButtons />
    </div>
  );
}
