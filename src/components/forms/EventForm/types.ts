// src/components/forms/EventForm/types.ts
import { eventSchema, type EventSchema } from "@/lib/formValidationSchemas";
import type { Event, Class } from "@/types/index";
import type { SubmitHandler, FieldErrors, UseFormRegister, UseFormHandleSubmit, UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import type { Dispatch, SetStateAction } from "react";
import type { MutationDefinition } from "@reduxjs/toolkit/query";
import type { UseMutation } from "@reduxjs/toolkit/dist/query/react/buildHooks";

export interface EventFormProps {
  initialData?: Event | null;
  availableClasses: Pick<Class, 'id' | 'name'>[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface UseEventFormProps extends EventFormProps {
    createEvent: UseMutation<MutationDefinition<EventSchema, any, "Announcement" | "Assignment" | "Attendance" | "Class" | "Event" | "Exam" | "Grade" | "Lesson" | "Parent" | "Result" | "Student" | "Subject" | "Teacher", Event>>;
    updateEvent: UseMutation<MutationDefinition<EventSchema & { id: number }, any, "Announcement" | "Assignment" | "Attendance" | "Class" | "Event" | "Exam" | "Grade" | "Lesson" | "Parent" | "Result" | "Student" | "Subject" | "Teacher", Event>>;
}


export interface EventFormReturn extends UseFormReturn<z.infer<typeof eventSchema>> {
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}
