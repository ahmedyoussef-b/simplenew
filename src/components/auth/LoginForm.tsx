// src/components/auth/LoginForm.tsx
'use client';

import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Adresse e-mail ou nom d'utilisateur</Label>
          <Input
            id="email"
            type="text"
            placeholder="nom@exemple.com"
            autoComplete="email"
            {...register('email')}
            disabled={isLoading}
          />
          <FormError error={errors.email} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
              <Label htmlFor="password">Mot de passe</Label>
              <Link href="/forgot-password" passHref legacyBehavior>
                  <a className="text-sm text-primary hover:underline">Mot de passe oublié ?</a>
              </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            disabled={isLoading}
          />
          <FormError error={errors.password} />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
          Se Connecter
        </Button>
      </form>
      <SocialSignInButtons />
      <div className="text-center text-sm">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Inscrivez-vous
        </Link>
      </div>
    </div>
  );
}
