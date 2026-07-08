"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useForms";
import type {
  FormSchema,
  FormField as FormFieldType,
} from "@/types/form.types";

interface DynamicFormProps {
  formId: string;
  schema: FormSchema;
}

function buildZodSchema(fields: FormFieldType[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        fieldSchema = z.string().email("Ingresa un correo válido");
        break;
      case "number":
        fieldSchema = z.coerce.number({
          invalid_type_error: "Ingresa un número válido",
        });
        break;
      case "checkbox":
        fieldSchema = z.boolean();
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === "checkbox") {
        fieldSchema = (fieldSchema as z.ZodBoolean).refine(
          (val) => val === true,
          {
            message: "Este campo es requerido",
          },
        );
      } else {
        fieldSchema = (fieldSchema as z.ZodString).min(
          1,
          "Este campo es requerido",
        );
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  });

  return z.object(shape);
}

export function DynamicForm({ formId, schema }: DynamicFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const submitForm = useSubmitForm();

  const zodSchema = useMemo(
    () => buildZodSchema(schema.fields),
    [schema.fields],
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: schema.fields.reduce(
      (acc, field) => {
        acc[field.name] = field.type === "checkbox" ? false : "";
        return acc;
      },
      {} as Record<string, unknown>,
    ),
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      console.log("dynamic form data", data);
      await submitForm.mutateAsync({ formId, data });
      toast({
        title: "Formulario enviado",
        description: "Tu respuesta ha sido registrada correctamente.",
      });
      router.push("/forms");
    } catch (error) {
      toast({
        title: "Error al enviar",
        description: "No se pudo enviar el formulario. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const renderField = (field: FormFieldType) => {
    const error = errors[field.name];
    const errorMessage = error?.message as string | undefined;

    switch (field.type) {
      case "textarea":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              aria-invalid={!!error}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "select":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Select
              onValueChange={(value) => setValue(field.name, value)}
              defaultValue={watch(field.name) as string}
            >
              <SelectTrigger id={field.name} aria-invalid={!!error}>
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "checkbox":
        return (
          <Field key={field.name}>
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.name}
                checked={watch(field.name) as boolean}
                onCheckedChange={(checked) => setValue(field.name, checked)}
              />
              <FieldLabel htmlFor={field.name} className="mb-0 cursor-pointer">
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FieldLabel>
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "radio":
        return (
          <Field key={field.name}>
            <FieldLabel>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <RadioGroup
              onValueChange={(value) => setValue(field.name, value)}
              defaultValue={watch(field.name) as string}
            >
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${field.name}-${option.value}`}
                  />
                  <label
                    htmlFor={`${field.name}-${option.value}`}
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </RadioGroup>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "date":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Input
              id={field.name}
              type="date"
              {...register(field.name)}
              aria-invalid={!!error}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "number":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Input
              id={field.name}
              type="number"
              placeholder={field.placeholder}
              {...register(field.name)}
              aria-invalid={!!error}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      case "email":
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Input
              id={field.name}
              type="email"
              placeholder={field.placeholder}
              {...register(field.name)}
              aria-invalid={!!error}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );

      default:
        return (
          <Field key={field.name}>
            <FieldLabel htmlFor={field.name}>
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </FieldLabel>
            <Input
              id={field.name}
              type="text"
              placeholder={field.placeholder}
              {...register(field.name)}
              aria-invalid={!!error}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </Field>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="space-y-4">
        {schema.fields.map(renderField)}
      </FieldGroup>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar formulario"
          )}
        </Button>
      </div>
    </form>
  );
}
