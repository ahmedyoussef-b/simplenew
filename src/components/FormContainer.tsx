// src/components/FormContainer.tsx
import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
    | "grade"
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance" 
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any; // Data for pre-filling update forms, type varies by table
  id?: number | string; // ID for delete operations
  relatedData?: any; // To pass any extra needed data to the forms
};

// This is now a simple wrapper component.
// All data-fetching logic has been moved to the individual pages/forms that need it.
const FormContainer = (props: FormContainerProps) => {
  return <FormModal {...props} />;
};

export default FormContainer;
