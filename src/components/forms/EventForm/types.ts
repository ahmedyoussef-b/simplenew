// src/components/forms/EventForm/types.ts
import { EventSchema } from "@/lib/formValidationSchemas";
import type { Event, Class } from "@/types/index";
import type { SubmitHandler, FieldErrors, UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import type { z } from "zod";
import type { Dispatch, SetStateAction } from "react";
import { UseMutation } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { MutationDefinition } from "@reduxjs/toolkit/query";

export interface EventFormProps {
  initialData?: z.infer<typeof eventSchema> | null;
  availableClasses: Pick<Class, 'id' | 'name'>[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface UseEventFormProps extends Omit<EventFormProps, 'setOpen'> {
    setOpen: Dispatch<SetStateAction<boolean>>;
    createEvent: UseMutation<MutationDefinition<any, any, any, any>>;
    updateEvent: UseMutation<MutationDefinition<any, any, any, any>>;
}


export interface EventFormReturn {
  register: UseFormRegister<z.infer<typeof eventSchema>>; 
  handleSubmit: UseFormHandleSubmit<z.infer<typeof eventSchema>>; 
  onSubmit: SubmitHandler<z.infer<typeof eventSchema>>; 
  errors: FieldErrors<z.infer<typeof eventSchema>>; 
}
