//src/components/forms/EventForm.tsx
"use client";

import { Button } from "@/components/ui/button";
import FormFields from "./FormFields";
import useEventForm from "./useEventForm";
import { EventFormProps } from "./types";

const EventForm = ({
  initialData,
  availableClasses,
  onSubmit: onFormSubmit,
}: EventFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    isLoading,
    actualOnSubmit,
  } = useEventForm({ initialData, availableClasses, onSubmit: onFormSubmit });

  return (
    <form onSubmit={handleSubmit(actualOnSubmit)} className="space-y-6">
      <h1 className="text-xl font-semibold">
        {initialData ? "Modifier l'Événement" : "Créer un Nouvel Événement"}
      </h1>

      <FormFields 
        register={register}
        errors={errors}
        isLoading={isLoading}
        availableClasses={availableClasses}
        initialData={initialData}
      />

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Enregistrement...' : 
         (initialData ? "Mettre à jour l'événement" : "Créer l'événement")}
      </Button>
    </form>
  );
};

export default EventForm;
