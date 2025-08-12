import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useCreateEventMutation, useUpdateEventMutation } from "@/lib/redux/api/entityApi/index";
import { eventSchema, type EventSchema } from "@/lib/formValidationSchemas";
import type { EventFormProps, EventFormReturn } from "./types";

const useEventForm = ({
  initialData,
  onSubmit: onFormSubmit,
}: EventFormProps): EventFormReturn => {
  const router = useRouter();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const isLoading = isCreating || isUpdating;

  const { register, handleSubmit, formState: { errors } } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      startTime: initialData?.startTime ? new Date(initialData.startTime) : undefined,
      endTime: initialData?.endTime ? new Date(initialData.endTime) : undefined,
      classId: initialData?.classId || null,
    },
  });

  const actualOnSubmit: SubmitHandler<EventSchema> = async (data) => {
    try {
      if (initialData?.id) {
        await updateEvent({ id: initialData.id, ...data }).unwrap();
        toast({ title: "Succès", description: "Événement mis à jour avec succès." });
      } else {
        await createEvent(data).unwrap();
        toast({ title: "Succès", description: "Événement créé avec succès." });
      }
      onFormSubmit(data);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.data?.message || "Une erreur s'est produite."
      });
    }
  };

  return {
    register,
    handleSubmit,
    actualOnSubmit,
    errors,
    isLoading,
  };
};

export default useEventForm;
