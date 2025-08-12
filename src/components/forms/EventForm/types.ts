import { EventSchema, eventSchema } from "@/lib/formValidationSchemas";
import type { Event, Class } from "@/types/index";
import { SubmitHandler, FieldErrors, UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { z } from "zod";

export interface EventFormProps {
  initialData?: z.infer<typeof eventSchema> | null;
  availableClasses: Pick<Class, 'id' | 'name'>[];
  onSubmit: (data: z.infer<typeof eventSchema>) => void;
  loading?: boolean;
}

export interface EventFormReturn {
  register: UseFormRegister<z.infer<typeof eventSchema>>; 
  handleSubmit: UseFormHandleSubmit<z.infer<typeof eventSchema>>; 
  actualOnSubmit: SubmitHandler<z.infer<typeof eventSchema>>; 
  errors: FieldErrors<z.infer<typeof eventSchema>>; 
  isLoading: boolean;
}