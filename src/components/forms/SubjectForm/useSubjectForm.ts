//src/components/forms/SubjectForm/useSubjectForm.ts
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"; // Reverting import path
import { toast } from "@/hooks/use-toast";
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "../../../lib/redux/api/entityApi/index"; // Corrected import path
import type { SubjectSchema } from "@/types/index";
import { subjectSchema } from "@/lib/formValidationSchemas";
import type { SubjectFormProps, SubjectFormReturn } from "./types";

const useSubjectForm = ({
  type,
  data,
  setOpen,
  relatedData
}: SubjectFormProps): SubjectFormReturn => {
  const router = useRouter();

  const [createSubject, {
    isLoading: isCreating,
    isSuccess: createSuccess,
    isError: createIsError,
    error: createErrorData
  }] = useCreateSubjectMutation();

  const [updateSubject, {
    isLoading: isUpdating,
    isSuccess: updateSuccess,
    isError: updateIsError,
    error: updateErrorData
  }] = useUpdateSubjectMutation();

  const isLoading = isCreating || isUpdating;

  const form = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: data ? { // Modified defaultValues
      ...data,
      teachers: data.teachers?.map(teacher => String(teacher.id)) || [], // Map teachers to an array of string IDs
    } : {},
  });

  const { register, handleSubmit, formState: { errors }, setValue } = form;

  const onSubmit: SubmitHandler<SubjectSchema> = async (formData) => {
    try {
      if (type === "create") {
        await createSubject(formData).unwrap();
      } else if (data?.id) {
        await updateSubject({ ...formData, id: data.id }).unwrap();
      }
    } catch (err) {
      // Error is handled by useEffect below
    }
  };

  useEffect(() => {
    if (createSuccess || updateSuccess) {
      toast({ title: `Subject ${type === "create" ? "created" : "updated"} successfully!` });
      setOpen(false);
      router.refresh();
    }
  }, [createSuccess, updateSuccess, setOpen, router, type]);

  useEffect(() => {
    if (createIsError || updateIsError) {
      const apiError = (createErrorData || updateErrorData) as any;
      const errorMessage = apiError?.data?.message || `Failed to ${type === "create" ? "create" : "update"} subject.`;
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }, [createIsError, updateIsError, createErrorData, updateErrorData, type]);


  // Extracting selectedTeachers from relatedData for the return type
  const selectedTeachers = relatedData?.selectedTeachers; // Assuming relatedData might contain selectedTeachers


  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    onSubmit,
    createErrorData: createErrorData as FetchBaseQueryError  | undefined, // Explicit type assertion
    updateErrorData: updateErrorData as FetchBaseQueryError  | undefined, // Explicit type assertion
    setValue,
    selectedTeachers: selectedTeachers || [], // Provide a default empty array if undefined
  };
};

export default useSubjectForm;
