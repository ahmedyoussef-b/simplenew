// src/components/auth/RegisterForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRegisterMutation } from "@/lib/redux/api/authApi";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Role } from "@/types/index"; 
import { useEffect } from "react";
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Spinner } from "@/components/ui/spinner";
import SocialSignInButtons from "./SocialSignInButtons";
import FormError from "@/components/forms/FormError";
import { cn } from "@/lib/utils";
import { registerSchema } from '@/lib/formValidationSchemas'; // Import the central schema
import z from "zod";


interface ApiErrorData {
  message: string;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error != null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error != null && 'message' in error;
}

export function RegisterForm() {
  const { register, handleSubmit, setValue, watch, formState: { errors }, setError } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const [registerUser, { isLoading, isSuccess, isError, error: registerErrorData }] = useRegisterMutation();
  const { toast } = useToast();
  const router = useRouter();

  const selectedRole = watch("role");

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé. Redirection...",
      });
    }
    if (isError && registerErrorData) {
      let errorMessage = "Une erreur inattendue s'est produite lors de l'inscription.";
      if (isFetchBaseQueryError(registerErrorData)) {
        const errorData = registerErrorData.data as ApiErrorData; 
        errorMessage = errorData?.message || `Erreur: ${registerErrorData.status}`;
      } else if (isSerializedError(registerErrorData)) {
        errorMessage = registerErrorData.message || "Un problème est survenu lors de l'inscription.";
      }
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description: errorMessage,
      });
    }
  }, [isSuccess, isError, registerErrorData, toast, router]);

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { type: "manual", message: "Les mots de passe ne correspondent pas." });
      return;
    }

    await registerUser(data); // Don't send confirmPassword to the API
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="pl-4">Nom complet (Optionnel)</Label>
          <Input
            id="name"
            placeholder="John Doe"
            {...register("name")}
            aria-invalid={errors.name ? "true" : "false"}
            className={cn(
              "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.name && "focus-visible:ring-destructive"
            )}
          />
          <FormError error={errors.name} className="pl-4" />
        </div>

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
          <Label htmlFor="password" className="pl-4">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="•••••••• (min. 8 caractères)"
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
            className={cn(
              "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.password && "focus-visible:ring-destructive"
            )}
          />
          <FormError error={errors.password} className="pl-4" />
        </div>

        {/* Add confirm password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="pl-4">Confirmer le mot de passe</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            className={cn(
              "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
              errors.confirmPassword && "focus-visible:ring-destructive"
            )}
          />
          <FormError error={errors.confirmPassword} className="pl-4" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role" className="pl-4">Rôle</Label>
          <Select
            onValueChange={(value) => setValue("role", value as Role, { shouldValidate: true })}
            value={selectedRole}
            disabled={isLoading}
          >
            <SelectTrigger 
              id="role" 
              aria-invalid={errors.role ? "true" : "false"}
              className={cn(
                "bg-background border-0 rounded-full shadow-neumorphic-inset transition-shadow focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-ring",
                errors.role && "focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Sélectionnez votre rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Role.TEACHER}>Enseignant</SelectItem>
              <SelectItem value={Role.PARENT}>Parent</SelectItem>
            </SelectContent>
          </Select>
          <FormError error={errors.role} className="pl-4" />
        </div>

        <Button 
          type="submit" 
          className="w-full rounded-full bg-background text-foreground hover:bg-background hover:text-primary shadow-neumorphic active:shadow-neumorphic-inset transition-all" 
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {isLoading ? "Création du compte..." : "Créer un compte"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link href={`/login`} className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </>
  );
}
