import { NextResponse } from "next/server";
import type { Form } from "@/types/form.types";

// Mock forms data (same as in /api/forms)
const MOCK_FORMS: Form[] = [
  {
    id: "form-1",
    title: "Solicitud de Vacaciones",
    description: "Formulario para solicitar días de vacaciones anuales",
    category: "RRHH",
    type: "native",
    schema: {
      fields: [
        {
          name: "fechaInicio",
          label: "Fecha de inicio",
          type: "date",
          required: true,
        },
        {
          name: "fechaFin",
          label: "Fecha de fin",
          type: "date",
          required: true,
        },
        {
          name: "motivo",
          label: "Motivo",
          type: "textarea",
          required: false,
          placeholder: "Describe brevemente el motivo de tu solicitud",
        },
        {
          name: "tipoVacaciones",
          label: "Tipo de vacaciones",
          type: "select",
          required: true,
          options: [
            { label: "Vacaciones anuales", value: "anuales" },
            { label: "Días personales", value: "personales" },
            { label: "Licencia sin goce", value: "licencia" },
          ],
        },
        {
          name: "contactoEmergencia",
          label: "Contacto de emergencia",
          type: "text",
          required: true,
          placeholder: "Nombre y teléfono",
        },
      ],
    },
  },
  {
    id: "form-2",
    title: "Evaluación de Desempeño",
    description: "Encuesta de evaluación trimestral para empleados",
    category: "RRHH",
    type: "embedded",
    embedUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSeR2UZnL3mjnnIxdFxhes4ZYwcb2ezts0rup7wRni_A8WDnqg/viewform?embedded=true",
  },
  {
    id: "form-3",
    title: "Solicitud de Equipos",
    description: "Formulario para solicitar equipos de cómputo o mobiliario",
    category: "Operaciones",
    type: "native",
    schema: {
      fields: [
        {
          name: "nombreEmpleado",
          label: "Nombre del empleado",
          type: "text",
          required: true,
        },
        {
          name: "emailEmpleado",
          label: "Correo electrónico",
          type: "email",
          required: true,
        },
        {
          name: "tipoEquipo",
          label: "Tipo de equipo",
          type: "radio",
          required: true,
          options: [
            { label: "Laptop", value: "laptop" },
            { label: "Monitor", value: "monitor" },
            { label: "Teclado/Mouse", value: "perifericos" },
            { label: "Silla ergonómica", value: "silla" },
            { label: "Otro", value: "otro" },
          ],
        },
        {
          name: "cantidad",
          label: "Cantidad",
          type: "number",
          required: true,
          placeholder: "1",
        },
        {
          name: "justificacion",
          label: "Justificación",
          type: "textarea",
          required: true,
          placeholder: "Explica por qué necesitas este equipo",
        },
        {
          name: "urgente",
          label: "Es una solicitud urgente",
          type: "checkbox",
          required: false,
        },
      ],
    },
  },
  {
    id: "form-4",
    title: "Registro de Horas Extras",
    description:
      "Formulario para registrar horas trabajadas fuera del horario regular",
    category: "Operaciones",
    type: "native",
    schema: {
      fields: [
        { name: "fecha", label: "Fecha", type: "date", required: true },
        {
          name: "horasExtra",
          label: "Horas extras trabajadas",
          type: "number",
          required: true,
          placeholder: "2",
        },
        {
          name: "proyecto",
          label: "Proyecto/Actividad",
          type: "text",
          required: true,
          placeholder: "Nombre del proyecto o actividad",
        },
        {
          name: "descripcion",
          label: "Descripción del trabajo realizado",
          type: "textarea",
          required: true,
        },
        {
          name: "aprobadoPor",
          label: "Aprobado por (supervisor)",
          type: "text",
          required: true,
        },
      ],
    },
  },
  {
    id: "form-5",
    title: "Reembolso de Gastos",
    description: "Solicitud de reembolso por gastos relacionados con trabajo",
    category: "Finanzas",
    type: "native",
    schema: {
      fields: [
        {
          name: "fechaGasto",
          label: "Fecha del gasto",
          type: "date",
          required: true,
        },
        {
          name: "monto",
          label: "Monto (USD)",
          type: "number",
          required: true,
          placeholder: "0.00",
        },
        {
          name: "categoria",
          label: "Categoría",
          type: "select",
          required: true,
          options: [
            { label: "Transporte", value: "transporte" },
            { label: "Alimentación", value: "alimentacion" },
            { label: "Hospedaje", value: "hospedaje" },
            { label: "Materiales de oficina", value: "materiales" },
            { label: "Otros", value: "otros" },
          ],
        },
        {
          name: "descripcion",
          label: "Descripción",
          type: "textarea",
          required: true,
          placeholder: "Detalla el gasto realizado",
        },
        {
          name: "tieneComprobante",
          label: "Tengo comprobante/factura adjunta",
          type: "checkbox",
          required: true,
        },
      ],
    },
  },
  {
    id: "form-6",
    title: "Encuesta de Clima Laboral",
    description: "Encuesta anónima sobre el ambiente de trabajo",
    category: "General",
    type: "embedded",
    embedUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSe-climate-survey/viewform?embedded=true",
  },
  {
    id: "form-7",
    title: "Actualización de Datos Personales",
    description:
      "Formulario para actualizar información personal en el sistema",
    category: "General",
    type: "native",
    schema: {
      fields: [
        {
          name: "nombreCompleto",
          label: "Nombre completo",
          type: "text",
          required: true,
        },
        {
          name: "email",
          label: "Correo electrónico personal",
          type: "email",
          required: true,
        },
        {
          name: "telefono",
          label: "Teléfono de contacto",
          type: "text",
          required: true,
          placeholder: "+1 234 567 8900",
        },
        {
          name: "direccion",
          label: "Dirección actual",
          type: "textarea",
          required: true,
          placeholder: "Calle, número, ciudad, código postal",
        },
        {
          name: "contactoEmergencia",
          label: "Contacto de emergencia",
          type: "text",
          required: true,
          placeholder: "Nombre y teléfono",
        },
      ],
    },
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const form = MOCK_FORMS.find((f) => f.id === id);

  if (!form) {
    return NextResponse.json(
      { error: "Formulario no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(form);
}
