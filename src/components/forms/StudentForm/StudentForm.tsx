// src/components/forms/StudentForm/StudentForm.tsx
"use client";

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FormFields from "./FormFields";
import useStudentForm from "./useStudentForm";
import { StudentFormProps } from "./types";
import { StudentSchema } from "@/lib/formValidationSchemas";

const StudentForm = ({ type, data, setOpen, relatedData }: StudentFormProps) => {
  // Transform data to match the expected types for useStudentForm and FormFields
  const transformedData = data ? {
    ...data,
    classId: data.classId ?? 0, // Convert null to a default number
    gradeId: data.gradeId ?? 0,   // Convert null to a default number
    parentId: data.parentId ?? '', // Convert null to an empty string
    birthday: data.birthday ? new Date(data.birthday) : new Date(), // Provide a default Date object
  } : undefined;

  const formMethods = useStudentForm({ type, data: transformedData as any, setOpen }); // Pass transformedData to useStudentForm with temporary cast

  return (
    <form onSubmit={formMethods.handleSubmit(formMethods.onSubmit)} className="space-y-4">
      <FormFields
        {...formMethods}
        relatedData={relatedData}
        type={type}
        data={transformedData} // Pass the transformed data to FormFields
      />
      {/* Add form submission button or actions here if needed */}
      <button type="submit" disabled={formMethods.isLoading} className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
        {formMethods.isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default StudentForm;
