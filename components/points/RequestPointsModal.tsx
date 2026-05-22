"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { Area } from "@/types/user.types";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { LeadersData, useGetLeaders } from "@/hooks/useGetLeaders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface RequestPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, amount: number, leaderId?: string) => void;
  isSubmitting: boolean;
}

type AchievementItem = {
  label: string;
  value: number;
};

type AchievementGroup = {
  title: string;
  description: string;
  items: AchievementItem[];
};

const requestPointsSchema = z.object({
  selectedAchievements: z.array(z.string()).default([]),
  amount: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().min(1, "La justificación es requerida"),
  leaderId: z.string().optional(),
});

type RequestPointsFormData = z.infer<typeof requestPointsSchema>;

export function RequestPointsModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: RequestPointsModalProps) {
  const { user } = useAuth();

  const { requests: leaders, isLoading, error, reload } = useGetLeaders();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<RequestPointsFormData>({
    resolver: zodResolver(requestPointsSchema),
    defaultValues: {
      selectedAchievements: [],
      amount: 0,
      reason: "",
      leaderId: undefined,
    },
    mode: "onChange",
  });

  const selectedAchievements = watch("selectedAchievements") || [];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        selectedAchievements: [],
        amount: 0, // Using 0 so the input is empty initially or 0
        reason: "",
        leaderId: undefined,
      });
    }
  }, [isOpen, reset]);

  const generalAchievementGroup: AchievementGroup = {
    title: "ACCIONES GENERALES",
    description:
      "Seleccione la acción que realizó y por la cual solicita puntos",
    items: [
      { label: "Cumplir o superar metas del área en el mes", value: 50 },
      { label: "Incrementar productividad en más del 10%", value: 50 },
      {
        label: "Ayudar a un compañero con carga laboral fuera de sus funciones",
        value: 50,
      },
      { label: "Organizar una actividad para fortalecer el equipo", value: 50 },
      { label: "Presentar una idea innovadora que se implemente", value: 100 },
      { label: "Automatizar o mejorar un proceso interno", value: 100 },
      {
        label: "Sugerir e implementar mejoras en la experiencia del cliente",
        value: 50,
      },
      {
        label: "Obtener una certificación relevante para el puesto",
        value: 100,
      },
      { label: "Impartir una capacitación a colegas", value: 100 },
      {
        label: "Resolver un conflicto entre compañeros de manera efectiva",
        value: 50,
      },
      {
        label:
          "Prevenir o solucionar un problema antes de que impacte al cliente",
        value: 50,
      },
      { label: "Responder rápidamente a una crisis operativa", value: 50 },
      {
        label: "Recibir una calificación de satisfacción superior al 90%",
        value: 30,
      },
      { label: "Obtener una mención positiva en redes sociales", value: 20 },
      { label: "Cumplir un año en la empresa (a partir de 2025)", value: 100 },
      { label: "No ausentarse durante 6 meses", value: 100 },
      {
        label: "Mantenerse en el top 3 de desempeño por 3 trimestres",
        value: 100,
      },
      {
        label:
          "Brindar soporte en días adicionales cuando la empresa lo requiera",
        value: 50,
      },
    ],
  };

  const areaAchievementGroups: Partial<Record<Area, AchievementGroup>> = {
    [Area.MERCADEO]: {
      title: "MERCADEO",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label:
            "Detectar y aprovechar una tendencia viral que incremente interacciones",
          value: 100,
        },
        {
          label:
            "Ser destacado por gerencia o equipo por gestión o contenido excepcional",
          value: 50,
        },
        {
          label: "Proponer ideas innovadoras que se implementen con éxito",
          value: 50,
        },
        {
          label:
            "Realizar un video con concepto diferente bien recibido por el equipo",
          value: 20,
        },
        {
          label:
            "Entregar proyectos importantes con mínimo dos días de anticipación",
          value: 20,
        },
      ],
    },
    [Area.SERVICIO_AL_CLIENTE]: {
      title: "SERVICIO AL CLIENTE Y RECURSOS HUMANOS",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label: "Reducir quejas recurrentes mediante mejora de procesos",
          value: 50,
        },
        {
          label:
            "Ofrecer una solución innovadora que aumente la satisfacción del cliente",
          value: 20,
        },
        {
          label: "Recibir una calificación de satisfacción superior al 90%",
          value: 50,
        },
        {
          label: "Implementar una nueva medida de seguridad efectiva",
          value: 100,
        },
        {
          label: "Diseñar un programa de bienestar laboral efectivo",
          value: 100,
        },
        {
          label: "Reducir los índices de estrés laboral en la empresa",
          value: 50,
        },
        {
          label:
            "Implementar una estrategia de salud, bienestar psicológico o emocional",
          value: 50,
        },
      ],
    },
    [Area.AUXILIARES]: {
      title: "AUXILIARES",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        { label: "Apoyar tareas fuera de sus funciones", value: 100 },
        { label: "Proponer una mejora en la eficiencia del área", value: 50 },
        { label: "Cumplir tareas operativas en tiempo récord", value: 100 },
        { label: "Apoyar a un compañero con carga laboral", value: 50 },
        {
          label: "Mantener el área de trabajo en óptimas condiciones",
          value: 30,
        },
      ],
    },
    [Area.CONTABILIDAD]: {
      title: "RESERVAS Y CONTABILIDAD",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label: "Gestionar auditorías sin observaciones negativas",
          value: 80,
        },
        { label: "Automatizar procesos contables con éxito", value: 90 },
        { label: "Presentar informes financieros sin errores", value: 50 },
        { label: "Cumplir obligaciones fiscales sin observaciones", value: 50 },
        { label: "Gestionar pagos sin errores y a tiempo", value: 40 },
        {
          label:
            "Identificar inconsistencias en registros financieros antes de auditoría",
          value: 50,
        },
        { label: "Reducir el tiempo de respuesta en reservas", value: 50 },
        {
          label:
            "Asegurar que el 100% de las reservas sean gestionadas sin errores",
          value: 100,
        },
      ],
    },
    [Area.PRODUCTO]: {
      title: "LÍDER DE PRODUCTO",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label: "Diseñar una nueva línea de productos innovadora",
          value: 100,
        },
        {
          label: "Reducir costos de producción sin afectar la calidad",
          value: 50,
        },
        {
          label: "Identificar tendencias de mercado antes que la competencia",
          value: 50,
        },
        { label: "Lanzar un producto con aceptación del 90% o más", value: 50 },
        {
          label:
            "Mejorar un producto existente con base en feedback del cliente",
          value: 50,
        },
        {
          label: "Implementar una innovación en la gestión de inventarios",
          value: 100,
        },
      ],
    },
    [Area.MAYORISTA]: {
      title: "MAYORISTA",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        { label: "Aumentar ventas mayoristas en al menos 50%", value: 100 },
        {
          label:
            "Fidelizar un cliente mayorista con más de 3 compras consecutivas",
          value: 50,
        },
        { label: "Mantener control de stock con precisión", value: 40 },
        { label: "Mejorar la eficiencia en despacho sin errores", value: 50 },
        { label: "Agilizar despachos en menos de 48 horas", value: 40 },
      ],
    },
    [Area.TECNOLOGIA]: {
      title: "TECNOLOGÍA",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label:
            "Automatizar un proceso interno que reduzca tiempos operativos en al menos 30%",
          value: 100,
        },
        {
          label:
            "Implementar una mejora tecnológica que impacte directamente la productividad del equipo",
          value: 100,
        },
        {
          label:
            "Reducir el tiempo promedio de respuesta a incidencias técnicas en un 40%",
          value: 50,
        },
        {
          label:
            "Garantizar estabilidad operativa sin caídas del sistema durante el trimestre",
          value: 50,
        },
        {
          label:
            "Implementar mejoras en seguridad de la información sin observaciones críticas",
          value: 100,
        },
        {
          label:
            "Desarrollar una herramienta interna que optimice procesos comerciales o administrativos",
          value: 100,
        },
        {
          label:
            "Proponer e implementar una innovación tecnológica aprobada por gerencia",
          value: 50,
        },
        {
          label:
            "Capacitar al equipo en el uso de nuevas herramientas digitales implementadas",
          value: 50,
        },
      ],
    },
    [Area.DIRECCION_GERENCIA]: {
      title: "DIRECCIÓN Y SUPERVISIÓN",
      description:
        "Seleccione la acción que realizó y por la cual solicita puntos",
      items: [
        {
          label:
            "Diseñar e implementar una estrategia de crecimiento con éxito",
          value: 100,
        },
        {
          label: "Mejorar la rentabilidad de la empresa en más del 30%",
          value: 100,
        },
        {
          label: "Implementar una estrategia de innovación exitosa",
          value: 100,
        },
        {
          label: "Coordinar con éxito un plan de expansión a nuevos mercados",
          value: 100,
        },
      ],
    },
  };

  const achievementGroups = useMemo(() => {
    const groups: AchievementGroup[] = [generalAchievementGroup];

    if (user?.area && areaAchievementGroups[user.area as Area]) {
      groups.push(areaAchievementGroups[user.area as Area]!);
    }

    return groups;
  }, [user]);

  const allAchievementItems = useMemo(() => {
    return achievementGroups.flatMap((group) => group.items);
  }, [achievementGroups]);

  const handleCheckboxChange = (label: string, checked: boolean) => {
    let updatedSelections: string[] = [];

    if (checked) {
      updatedSelections = [...selectedAchievements, label];
    } else {
      updatedSelections = selectedAchievements.filter((item) => item !== label);
    }

    setValue("selectedAchievements", updatedSelections, {
      shouldValidate: true,
    });

    const total = allAchievementItems
      .filter((item) => updatedSelections.includes(item.label))
      .reduce((sum, item) => sum + item.value, 0);

    setValue("amount", total || 0, { shouldValidate: true });
    setValue("reason", updatedSelections.join(", "), { shouldValidate: true });
  };

  const onFormSubmit = (data: RequestPointsFormData) => {
    console.log(data);
    onSubmit(data.reason, data.amount, data.leaderId);
  };

  console.log("area", user?.area);
  console.log(achievementGroups);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitar Puntos</DialogTitle>
          <DialogDescription>
            Envía una solicitud a tu líder para obtener puntos adicionales por
            tus logros o actividades especiales.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 py-4">
          <div className="space-y-6">
            {achievementGroups.map((group) => (
              <div
                key={group.title}
                className="space-y-3 border rounded-xl p-5 bg-card/50 shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-base text-primary">
                    {group.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {group.items.map((item) => (
                    <label
                      key={item.label}
                      htmlFor={item.label}
                      className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedAchievements.includes(item.label)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <Checkbox
                        id={item.label}
                        checked={selectedAchievements.includes(item.label)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(item.label, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 text-sm leading-5 font-normal select-none">
                        <span className="font-semibold text-primary mr-1">
                          ({item.value} pts)
                        </span>
                        {item.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="reason">Motivo o Justificación</FieldLabel>
              <Textarea
                id="reason"
                placeholder="Describe brevemente por qué estás solicitando estos puntos..."
                className="min-h-[100px] resize-none"
                {...register("reason")}
              />
              {errors.reason && (
                <p className="text-sm text-destructive">
                  {errors.reason.message}
                </p>
              )}
            </Field>

            {/* SELECTOR DE LIDERES */}
            {!user?.leaderId && (
              <Field className="md:col-span-1">
                <FieldLabel htmlFor="leader">Seleccionar Líder</FieldLabel>
                <Select
                  // id="leader"
                  onValueChange={(leaderId) => {
                    setValue("leaderId", leaderId, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar Líder" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaders.map((leader) => (
                      <SelectItem key={leader.userId} value={leader.userId}>
                        {leader.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </Field>
            )}

            <Field className="md:col-span-1">
              <FieldLabel htmlFor="amount">Cantidad de puntos</FieldLabel>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Ej. 500"
                className="text-lg font-semibold"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
