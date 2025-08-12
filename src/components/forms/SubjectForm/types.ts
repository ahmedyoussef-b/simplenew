//src/components/forms/SubjectForm/types.ts
import type { Dispatch, SetStateAction } from "react";
import type { Subject, Teacher } from "@/types/index"; // Assuming Subject and Teacher are imported
import type { UseFormSetValue, UseFormRegister, UseFormHandleSubmit, FieldErrors, SubmitHandler } from "react-hook-form"; // Import necessary types from react-hook-form
import type { SubjectSchema } from "@/lib/formValidationSchemas"; // Assuming SubjectSchema is imported from formValidationSchemas
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface SubjectFormProps {
  type: "create" | "update";
  data?: Subject & { teachers?: Pick<Teacher, 'id'>[] };
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { // Assuming relatedData structure based on useSubjectForm
    selectedTeachers?: Teacher[]; // Adjust with a more specific type if possible
    // Add other potential related data properties here
  };
}

export interface SubjectFormReturn {
  register: UseFormRegister<SubjectSchema>; // Using more specific type
  handleSubmit: UseFormHandleSubmit<SubjectSchema>; // Using more specific type
  errors: FieldErrors<SubjectSchema>; // Using more specific type
  isLoading: boolean;
  onSubmit: SubmitHandler<SubjectSchema>; // Corrected type
  setValue: UseFormSetValue<SubjectSchema>; // Added setValue property with specific type
  createErrorData: FetchBaseQueryError | undefined; // Corrected type
  updateErrorData: FetchBaseQueryError | undefined; // Corrected type
  selectedTeachers: Teacher[]; // Assuming this was added previously, adjust type if possible
}
