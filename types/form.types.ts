export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "checkbox"
  | "radio";

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
}

export interface FormSchema {
  fields: FormField[];
}

export type FormType = "EMBEDDED" | "NATIVE";

export type FormCategory = "RRHH" | "Operaciones" | "Finanzas" | "General";

export interface Form {
  formId: string;
  title: string;
  description: string;
  category: FormCategory;
  type: FormType;
  embedUrl?: string;
  schema?: FormSchema;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormSubmission {
  formId: string;
  data: Record<string, unknown>;
}
