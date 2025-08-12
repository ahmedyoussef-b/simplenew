// src/components/forms/SubjectForm/SubjectForm.tsx
"use client";

import React from 'react';
import {
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
  UseFormSetValue,
} from "react-hook-form";
import FormFields from "./FormFields";
import useSubjectForm from "./useSubjectForm";
import { SubjectFormProps, SubjectFormReturn } from "./types";
import { SubjectSchema } from "@/lib/formValidationSchemas";

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: SubjectFormProps) => {
  const formMethods = useSubjectForm({ type, data, setOpen, relatedData });

  return (
    <form onSubmit={formMethods.handleSubmit(formMethods.onSubmit)} className="space-y-4">
      <FormFields
        register={formMethods.register}
        errors={formMethods.errors}
        isLoading={formMethods.isLoading}
        setValue={formMethods.setValue}
        teachers={relatedData?.selectedTeachers || []}
        type={type} selectedTeachers={[]}        // Removed data prop as it's not expected by FormFieldsProps
      />
      {/* Add form submission button or actions here if needed */}
      <button type="submit" disabled={formMethods.isLoading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {formMethods.isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default SubjectForm;
