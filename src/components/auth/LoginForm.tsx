'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/formValidationSchemas';
import type { LoginSchema as LoginSchemaType } from '@/types';
import { useLoginMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import SocialSignInButtons from './SocialSignInButtons';

export default function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const result = await login(data).unwrap();
      
      if (result.requires2FA) {
        // Store temp token and navigate to 2FA page
        sessionStorage.setItem('temp_token', result.tempToken);
        router.push('/verify-2fa');
        toast({ title: '2FA Required', description: 'Please enter your two-factor authentication code.' });
      } else {
        // If login is successful without 2FA, the session is set by the query hook
        toast({ title: 'Login Successful', description: 'Welcome back!' });
        router.push('/dashboard'); 
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: err.data?.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" prefetch={false} className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
        </div>
      </div>
      <SocialSignInButtons />
    </>
  );
}
