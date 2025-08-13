// src/components/auth/RegisterForm.tsx
'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterSchema } from '@/lib/formValidationSchemas';
import { useRegisterMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, UserPlus } from 'lucide-react';
import Link from 'next/link';
import FormError from '@/components/forms/FormError';
import { Role } from '@/types';

type RegisterFormValues = RegisterSchema;

export default function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: Role.PARENT },
  });

  const role = watch('role');

  const onSubmit: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      await registerUser(data).unwrap();
      toast({
        title: 'Compte créé !',
        description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de l\'inscription',
        description: error.data?.message || "Une erreur inattendue s'est produite.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input id="email" type="email" placeholder="nom@exemple.com" {...register('email')} disabled={isLoading} />
        <FormError error={errors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" type="password" {...register('password')} disabled={isLoading} />
        <FormError error={errors.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input id="confirmPassword" type="password" {...register('confirmPassword')} disabled={isLoading} />
        <FormError error={errors.confirmPassword} />
      </div>

      <div className="space-y-2">
        <Label>Je suis un...</Label>
        <RadioGroup
          value={role}
          onValueChange={(value) => setValue('role', value as Role, { shouldValidate: true })}
          className="flex gap-4"
          disabled={isLoading}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={Role.PARENT} id="role-parent" />
            <Label htmlFor="role-parent">Parent</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={Role.TEACHER} id="role-teacher" />
            <Label htmlFor="role-teacher">Enseignant</Label>
          </div>
        </RadioGroup>
        <FormError error={errors.role} />
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
        S'inscrire
      </Button>

      <div className="text-center text-sm">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Se connecter
        </Link>
      </div>
    </form>
  );
}
