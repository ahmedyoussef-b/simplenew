'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Loader2 } from 'lucide-react';
import PersonalInfoCard from './PersonalInfoCard';
import AuthInfoCard from './AuthInfoCard';
import useProfileForm from './useProfileForm';
import { UserProfile } from './types';

const ProfileForm: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
    setValue,
    imgUrl,
  } = useProfileForm(userProfile);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <PersonalInfoCard 
        register={register}
        errors={errors}
        isLoading={isLoading}
        setValue={setValue}
        imgUrl={imgUrl}
        userProfile={userProfile}
      />

      <AuthInfoCard 
        register={register}
        errors={errors}
        isLoading={isLoading}
        userProfile={userProfile}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
          {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
