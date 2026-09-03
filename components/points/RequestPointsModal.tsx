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
import {
  AchievementGroup,
  areaAchievementGroups,
  generalAchievementGroup,
} from "@/utils/points-achievements";

interface RequestPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, amount: number, leaderId?: string) => void;
  isSubmitting: boolean;
}

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

  useEffect(() => {
    if (isOpen) {
      reset({
        selectedAchievements: [],
        amount: 0,
        reason: "",
        leaderId: undefined,
      });
    }
  }, [isOpen, reset]);

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
    onSubmit(data.reason, data.amount, data.leaderId);
  };

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

            <div className="md:col-span-2">
              {user?.leaderName ? (
                <p className="text-sm text-muted-foreground">
                  Tu líder asociado es{" "}
                  <span className="font-semibold text-foreground">
                    {user.leaderName}.{" "}
                  </span>
                  Puedes seleccionar otro líder si lo deseas.
                </p>
              ) : (
                <p className="text-sm text-destructive font-medium">
                  No tienes un líder asignado. Por favor selecciona uno para
                  enviar tu solicitud.
                </p>
              )}
            </div>

            {/* SELECTOR DE LIDERES */}
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

            {/* {!user?.leaderId && (
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
            )} */}

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
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !isValid ||
                (!user?.leaderId && !watch("leaderId"))
              }
            >
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
