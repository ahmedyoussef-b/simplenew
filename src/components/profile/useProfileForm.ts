'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfileMutation } from "@/lib/redux/api/authApi";
import { profileUpdateSchema } from "@/lib/formValidationSchemas";
import { ProfileFormReturn, UserProfile } from "./types";
import { useState } from "react";

const useProfileForm = (userProfile: UserProfile): ProfileFormReturn => {
  const { toast } = useToast();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: userProfile.name,
      surname: userProfile.surname,
      username: userProfile.user.username,
      email: userProfile.user.email,
      phone: userProfile.phone || '',
      address: userProfile.address || '',
      img: userProfile.user.img || null,
      password: '',
      twoFactorEnabled: userProfile.user.twoFactorEnabled || false,
    },
  });

  const [imgUrl, setImgUrl] = useState<string | null>(userProfile.user.img || null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(userProfile.user.twoFactorEnabled || false);

  const onSubmit = async (data: any) => {
    const payload: any = { ...data };
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

export default useProfileForm;
