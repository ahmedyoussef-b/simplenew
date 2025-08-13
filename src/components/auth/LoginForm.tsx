// src/components/auth/LoginForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/lib/redux/api/authApi";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { useEffect } from "react";
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import FormError from "@/components/forms/FormError";
import { loginSchema, type LoginSchema as LoginCredentials } from "@/lib/formValidationSchemas";


interface ApiErrorData {
  message: string;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error != null && 'message' in error;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const [login, { isLoading, isSuccess, isError, error: loginErrorData, data: loginSuccessData }] = useLoginMutation();
  const { toast } = useToast();
  const router = useRouter(); 

  useEffect(() => {
    console.log("➡️ [LoginForm] useEffect triggered. isSuccess:", isSuccess, "isError:", isError, "loginSuccessData:", loginSuccessData);
    if (isSuccess && loginSuccessData) {
        console.log("✅ [LoginForm] Login successful. Redirecting to /dashboard.");
        toast({
            title: "Connexion réussie",
            description: "Vous allez être redirigé...",
        });
        router.push('/dashboard');
        router.refresh();
    }
    if (isError && loginErrorData) {
       console.error("❌ [LoginForm] Login mutation failed. Error data:", loginErrorData);
      let title = "Échec de la connexion";
      let description = "Une erreur inattendue s'est produite lors de la connexion.";

       if (isFetchBaseQueryError(loginErrorData)) {
        const errorData = loginErrorData.data as ApiErrorData;
        if (loginErrorData.status === 401 && errorData?.message === "Invalid credentials") {
          title = "Identifiants invalides";
          description = "Veuillez vérifier votre e-mail et votre mot de passe et réessayer.";
        } else {
          description = errorData?.message || `Erreur: ${loginErrorData.status}`;
        }
      } else if (isSerializedError(loginErrorData)) {
        description = loginErrorData.message || "Un problème est survenu lors de la connexion.";
      }
      toast({
        variant: "destructive",
        title: title,
        description: description,
      });
    }
  }, [isSuccess, isError, loginErrorData, loginSuccessData, toast, router]);

  const onSubmit = async (data: LoginCredentials) => {
    console.log("➡️ [LoginForm] Submitting login form with data:", data);
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="pl-4">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.com"
          {...register("email")}
          aria-invalid={errors.email ? "true" : "false"}
          className={cn(
            "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
            errors.email && "focus-visible:ring-destructive"
          )}
        />
        <FormError error={errors.email} className="pl-4" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="pl-4">Mot de passe</Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
          aria-invalid={errors.password ? "true" : "false"}
          className={cn(
            "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
            errors.password && "focus-visible:ring-destructive"
          )}
        />
        <FormError error={errors.password} className="pl-4" />
      </div>
      
      <Button 
        type="submit" 
        className="w-full rounded-full bg-background text-foreground hover:bg-background hover:text-primary shadow-neumorphic active:shadow-neumorphic-inset transition-all" 
        disabled={isLoading}
      >
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
