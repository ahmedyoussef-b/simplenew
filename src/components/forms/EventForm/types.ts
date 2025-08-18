// src/components/forms/EventForm/types.ts
import { eventSchema, type EventSchema } from "@/lib/formValidationSchemas";
import type { Event, Class } from "@/types/index";
import type { SubmitHandler, FieldErrors, UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import type { z } from "zod";
import type { Dispatch, SetStateAction } from "react";
import { UseMutation } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { MutationDefinition } from "@reduxjs/toolkit/query";

export interface EventFormProps {
  initialData?: Event | null;
  availableClasses: Pick<Class, 'id' | 'name'>[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface UseEventFormProps extends EventFormProps {
    createEvent: UseMutation<MutationDefinition<any, any, any, any>>;
    updateEvent: UseMutation<MutationDefinition<any, any, any, any>>;
}

export interface EventFormReturn {
    register: UseFormRegister<EventSchema>;
    handleSubmit: UseFormHandleSubmit<EventSchema>;
    onSubmit: SubmitHandler<EventSchema>;
    errors: FieldErrors<EventSchema>;
}
