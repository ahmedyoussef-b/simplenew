// src/components/profile/useProfileForm.ts
'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfileMutation } from "@/lib/redux/api/authApi";
import { profileUpdateSchema, type ProfileUpdateSchema } from "@/lib/formValidationSchemas";
import { UserProfile } from "./types";
import { useEffect } from "react";

interface UseProfileFormProps {
  userProfile: UserProfile;
}

export default function useProfileForm({ userProfile }: UseProfileFormProps) {
  const { toast } = useToast();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProfileUpdateSchema>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: userProfile.name ?? '',
      surname: userProfile.surname ?? '',
      username: userProfile.user.username,
      email: userProfile.user.email,
      phone: userProfile.phone || '',
      address: userProfile.address || '',
      img: userProfile.user.img || null,
      password: '',
      twoFactorEnabled: userProfile.user.twoFactorEnabled || false,
    },
  });

  const imgUrl = watch("img");
  const twoFactorEnabled = watch("twoFactorEnabled");
  
  const onSubmit: SubmitHandler<ProfileUpdateSchema> = async (data) => {
    // Send all form data to the server. The backend will handle what to update.
    const payload = { ...data };
    
    // Do not send an empty password field
    if (payload.password && payload.password.trim() === '') {
      delete payload.password;
    }

    try {
      await updateProfile(payload).unwrap();
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Échec de la mise à jour',
        description: error.data?.message || error.message || "Une erreur est survenue.",
      });
    }
  };
  
  // This useEffect ensures that if the img value in the form changes (e.g., from an upload),
  // it is reflected in the imgUrl state used for the preview.
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'img') {
        setValue('img', value.img, { shouldDirty: true });
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue]);


  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
    setValue,
    imgUrl,
    twoFactorEnabled,
  };
};
