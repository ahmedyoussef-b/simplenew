'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verify2FASchema } from '@/lib/formValidationSchemas';
import type { Verify2FASchema as Verify2FASchemaType } from '@/types';
import { useVerify2faMutation } from '@/lib/redux/api/authApi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export default function Verify2FAForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [verify2fa, { isLoading }] = useVerify2faMutation();
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
      const token = sessionStorage.getItem('temp_token');
      if (!token) {
          toast({
              variant: 'destructive',
              title: 'Verification Failed',
              description: 'No temporary token found. Please try logging in again.',
          });
          router.push('/login');
      } else {
          setTempToken(token);
      }
  }, [router, toast]);

  const form = useForm<Verify2FASchemaType>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: Verify2FASchemaType) => {
    if (!tempToken) return;

    try {
      await verify2fa({ ...data, tempToken }).unwrap();
      sessionStorage.removeItem('temp_token');
      toast({
        title: 'Login Successful',
        description: 'You are now securely logged in.',
      });
      router.push('/dashboard');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: err.data?.message || 'The code is invalid or has expired.',
      });
    }
  };
  
  if (!tempToken) {
    return <p className='text-center text-destructive'>Redirecting to login...</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Code</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </Form>
  );
}
