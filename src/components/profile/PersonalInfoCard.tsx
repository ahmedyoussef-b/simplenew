'use client';
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Home } from 'lucide-react';
import ImageUpload from './ImageUpload';
import DynamicAvatar from '@/components/DynamicAvatar';
import { UserProfile } from './types';
import FormError from '@/components/forms/FormError';

interface PersonalInfoCardProps {
  register: any;
  errors: any;
  isLoading: boolean;
  setValue: any;
  imgUrl: string | null;
  userProfile: UserProfile;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  register,
  errors,
  isLoading,
  setValue,
  imgUrl,
  userProfile,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Personnelles</CardTitle>
        <CardDescription>Détails visibles sur votre profil public.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
            <DynamicAvatar 
              imageUrl={imgUrl}
              seed={userProfile.user.id}
              isLCP={true}
            />
          </div>
          <ImageUpload 
            setValue={setValue}
            isLoading={isLoading}
          />
           <FormError error={errors.img} />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {userProfile.user.role !== 'STUDENT' && (
            <>
              <div>
                <Label htmlFor="name">Prénom</Label>
                <Input id="name" {...register("name")} disabled={isLoading} />
                <FormError error={errors.name} />
              </div>
              <div>
                <Label htmlFor="surname">Nom</Label>
                <Input id="surname" {...register("surname")} disabled={isLoading} />
                <FormError error={errors.surname} />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <Label htmlFor="phone" className="flex items-center"><Phone size={14} className="mr-2"/>Téléphone</Label>
            <Input id="phone" {...register("phone")} disabled={isLoading} />
            <FormError error={errors.phone} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address" className="flex items-center"><Home size={14} className="mr-2"/>Adresse</Label>
            <Input id="address" {...register("address")} disabled={isLoading} />
            <FormError error={errors.address} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoCard;
