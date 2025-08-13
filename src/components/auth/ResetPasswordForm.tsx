// src/components/auth/ResetPasswordForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useResetPasswordMutation } from '@/lib/redux/api/authApi';
import { useSearchParams, useRouter } from 'next/navigation';
import FormError from '@/components/forms/FormError';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        variant: 'destructive',
        title: 'Jeton manquant',
        description: 'Le jeton de réinitialisation est manquant ou invalide.',
      });
      return;
    }

    try {
      await resetPassword({ token, password: data.password }).unwrap();
      toast({
        title: 'Mot de passe réinitialisé',
        description: 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.data?.message || "Une erreur s'est produite.",
      });
    }
  };
  
  if (!token) {
    return (
      <div className="text-center text-destructive">
        <p>Jeton de réinitialisation invalide ou expiré.</p>
        <Button variant="link" asChild><Link href="/forgot-password">Demander un nouveau lien</Link></Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium">Mot de passe modifié !</h3>
        <Button asChild variant="link" className="mt-4">
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          disabled={isLoading}
        />
        <FormError error={errors.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
          disabled={isLoading}
        />
        <FormError error={errors.confirmPassword} />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="mr-2 h-4 w-4" />
        )}
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}
