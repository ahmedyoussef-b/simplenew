'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/lib/formValidationSchemas';
import type { ResetPasswordSchema as ResetPasswordSchemaType } from '@/types';
import { useResetPasswordMutation } from '@/lib/redux/api/authApi';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
        toast({
            variant: 'destructive',
            title: 'Invalid Link',
            description: 'The password reset link is missing a token.',
        });
        router.push('/forgot-password');
    }
  }, [token, router, toast]);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordSchemaType) => {
    if (!token) return;
    try {
      await resetPassword({ ...data, token }).unwrap();
      toast({
        title: 'Password Reset Successful',
        description: 'You can now log in with your new password.',
      });
      router.push('/login');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Reset Failed',
        description: err.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  if (!token) {
      return <p className='text-center text-destructive'>Invalid or missing reset token.</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
}
