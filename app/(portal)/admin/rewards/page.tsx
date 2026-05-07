'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react'
import { api } from '@/lib/axios'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRewards, type Reward } from '@/hooks/useRewards'

// Schema for a single reward
const rewardSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional().or(z.literal('')),
  cost: z.coerce.number().min(1, 'El costo debe ser mayor a 0'),
  imageUrl: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  imageFile: z.any().optional(),
  stock: z.coerce.number().optional().nullable(),
  isActive: z.boolean().optional().default(true),
})

// Schema for bulk create (array of rewards)
const bulkCreateSchema = z.object({
  data: z.array(rewardSchema).min(1, 'Agrega al menos una recompensa'),
})

type BulkCreateFormData = z.infer<typeof bulkCreateSchema>
type UpdateFormData = z.infer<typeof rewardSchema>

export default function AdminRewardsPage() {
  const { toast } = useToast()
  
  // Custom hook to fetch rewards
  const { rewards, isLoading: isLoadingRewards, reload } = useRewards()

  // State
  const [isBulkSheetOpen, setIsBulkSheetOpen] = useState(false)
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Bulk Create Form
  const {
    register: registerBulk,
    control: controlBulk,
    handleSubmit: handleBulkSubmit,
    reset: resetBulk,
    formState: { errors: bulkErrors },
  } = useForm<BulkCreateFormData>({
    resolver: zodResolver(bulkCreateSchema),
    defaultValues: {
      data: [{ name: '', description: '', cost: 0, imageUrl: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: controlBulk,
    name: 'data',
  })

  // Update Form
  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdate,
    setValue: setUpdateValue,
    formState: { errors: updateErrors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(rewardSchema),
  })

  // Open Update Sheet
  const handleEditClick = (reward: Reward) => {
    setSelectedReward(reward)
    resetUpdate({
      name: reward.name,
      description: reward.description,
      cost: reward.cost,
      imageUrl: reward.imageUrl,
      stock: reward.stock,
      isActive: reward.isActive,
    })
    setIsUpdateSheetOpen(true)
  }

  const toggleRewardStatus = async (reward: Reward) => {
    setActionLoadingId(reward.rewardId)
    try {
      await api.patch('/points/rewards/update', {
        rewardId: reward.rewardId,
        isActive: !reward.isActive,
      }, { skip401Redirect: true })
      
      toast({ title: reward.isActive ? 'Recompensa desactivada' : 'Recompensa activada' })
      await reload()
    } catch (err: any) {
      toast({
        title: 'Error al cambiar estado',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const deleteReward = async (rewardId: string) => {
    setActionLoadingId(rewardId)
    try {
      await api.delete('/points/rewards/delete', {
        data: { rewardId },
        skip401Redirect: true,
      })
      toast({ title: 'Recompensa eliminada' })
      await reload()
    } catch (err: any) {
      toast({
        title: 'Error al eliminar',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Handlers
  const onBulkSubmit = async (formData: BulkCreateFormData) => {
    setIsSaving(true)
    try {
      const hasFiles = formData.data.some((item) => item.imageFile && item.imageFile.length > 0)
      
      let payload: any = formData
      let config: any = { skip401Redirect: true }

      if (hasFiles) {
        payload = new FormData()
        
        const cleanData = formData.data.map(item => ({
          name: item.name,
          description: item.description,
          cost: item.cost,
          imageUrl: item.imageUrl,
        }))

        // Send JSON data as a string
        payload.append('data', JSON.stringify(cleanData))
        
        // Append all selected files
        formData.data.forEach((item, index) => {
          if (item.imageFile && item.imageFile.length > 0) {
            payload.append('files', item.imageFile[0])
          }
        })
        
        config.headers = { 'Content-Type': 'multipart/form-data' }
      }

      await api.post('/points/rewards/create/bulk', payload, config)
      toast({ title: 'Recompensas creadas exitosamente' })
      resetBulk()
      setIsBulkSheetOpen(false)
      await reload()
    } catch (err: any) {
      toast({
        title: 'Error al crear recompensas',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onUpdateSubmit = async (formData: UpdateFormData) => {
    if (!selectedReward) return
    setIsSaving(true)
    try {
      let payload: any = {
        rewardId: selectedReward.rewardId,
        ...formData,
      }
      delete payload.imageFile // Remove it from the JSON body

      let config: any = { skip401Redirect: true }

      if (formData.imageFile && formData.imageFile.length > 0) {
        payload = new FormData()
        payload.append('rewardId', selectedReward.rewardId)
        payload.append('name', formData.name)
        payload.append('cost', formData.cost.toString())
        if (formData.description) payload.append('description', formData.description)
        if (formData.imageUrl) payload.append('imageUrl', formData.imageUrl)
        if (formData.stock !== null && formData.stock !== undefined) payload.append('stock', formData.stock.toString())
        payload.append('isActive', String(formData.isActive))
        
        payload.append('file', formData.imageFile[0])
        config.headers = { 'Content-Type': 'multipart/form-data' }
      }

      await api.patch('/points/rewards/update', payload, config)
      
      toast({ title: 'Recompensa actualizada exitosamente' })
      setIsUpdateSheetOpen(false)
      await reload()
    } catch (err: any) {
      toast({
        title: 'Error al actualizar',
        description: err.response?.data?.message || err.message || 'Error desconocido',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (value?: string | null) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'No disponible'
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle>Administración de Recompensas</CardTitle>
            <CardDescription>
              Crea recompensas en masa y actualiza sus detalles.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={reload} disabled={isLoadingRewards}>
              {isLoadingRewards ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                'Actualizar'
              )}
            </Button>
            
            {/* Bulk Create Sheet */}
            <Button onClick={() => setIsBulkSheetOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Recompensas
            </Button>
            
            <Sheet open={isBulkSheetOpen} onOpenChange={setIsBulkSheetOpen}>
              <SheetContent className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Creación Masiva</SheetTitle>
                  <SheetDescription>
                    Agrega múltiples recompensas a la vez. Puedes subir una imagen o proveer la URL.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleBulkSubmit(onBulkSubmit)} className="space-y-6 px-1">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="relative">
                      <CardContent className="pt-6 space-y-4">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel>Nombre</FieldLabel>
                            <Input placeholder="Ej. Tiquete nacional" {...registerBulk(`data.${index}.name`)} />
                            {bulkErrors.data?.[index]?.name && (
                              <p className="text-sm text-destructive">{bulkErrors.data[index]?.name?.message}</p>
                            )}
                          </Field>
                          <Field>
                            <FieldLabel>Costo (Puntos)</FieldLabel>
                            <Input type="number" placeholder="Ej. 12000" {...registerBulk(`data.${index}.cost`)} />
                            {bulkErrors.data?.[index]?.cost && (
                              <p className="text-sm text-destructive">{bulkErrors.data[index]?.cost?.message}</p>
                            )}
                          </Field>
                          <Field className="md:col-span-2">
                            <FieldLabel>Descripción</FieldLabel>
                            <Textarea placeholder="Descripción de la recompensa..." {...registerBulk(`data.${index}.description`)} />
                          </Field>
                          <Field className="md:col-span-1">
                            <FieldLabel>Subir Imagen (Archivo)</FieldLabel>
                            <Input type="file" accept="image/*" {...registerBulk(`data.${index}.imageFile`)} />
                          </Field>
                          <Field className="md:col-span-1">
                            <FieldLabel>O URL de Imagen</FieldLabel>
                            <Input placeholder="https://..." {...registerBulk(`data.${index}.imageUrl`)} />
                            {bulkErrors.data?.[index]?.imageUrl && (
                              <p className="text-sm text-destructive">{bulkErrors.data[index]?.imageUrl?.message}</p>
                            )}
                          </Field>
                        </FieldGroup>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => append({ name: '', description: '', cost: 0, imageUrl: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir otra recompensa
                  </Button>

                  <SheetFooter className="pt-4">
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Guardar Todas'
                      )}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>

            {/* Update Sheet */}
            <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
              <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Actualizar Recompensa</SheetTitle>
                  <SheetDescription>
                    Modifica los campos de la recompensa seleccionada.
                  </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleUpdateSubmit(onUpdateSubmit)} className="space-y-4 px-1">
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Nombre</FieldLabel>
                      <Input {...registerUpdate('name')} />
                      {updateErrors.name && <p className="text-sm text-destructive">{updateErrors.name.message}</p>}
                    </Field>
                    <Field>
                      <FieldLabel>Costo (Puntos)</FieldLabel>
                      <Input type="number" {...registerUpdate('cost')} />
                      {updateErrors.cost && <p className="text-sm text-destructive">{updateErrors.cost.message}</p>}
                    </Field>
                    <Field>
                      <FieldLabel>Stock</FieldLabel>
                      <Input type="number" {...registerUpdate('stock')} placeholder="Dejar en blanco si es ilimitado" />
                    </Field>
                    <Field>
                      <FieldLabel>Descripción</FieldLabel>
                      <Textarea {...registerUpdate('description')} />
                    </Field>
                    <Field>
                      <FieldLabel>Subir Nueva Imagen (Archivo)</FieldLabel>
                      <Input type="file" accept="image/*" {...registerUpdate('imageFile')} />
                    </Field>
                    <Field>
                      <FieldLabel>O URL de Imagen</FieldLabel>
                      <Input {...registerUpdate('imageUrl')} />
                      {updateErrors.imageUrl && <p className="text-sm text-destructive">{updateErrors.imageUrl.message}</p>}
                    </Field>
                  </FieldGroup>
                  <SheetFooter className="pt-4 pb-4">
                    <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Actualizando...
                        </>
                      ) : (
                        'Guardar Cambios'
                      )}
                    </Button>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>

          </div>
        </CardHeader>
        <CardContent>
          {isLoadingRewards ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando recompensas...
            </div>
          ) : rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay recompensas registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Costo</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.rewardId}>
                    <TableCell>
                      {reward.imageUrl ? (
                        <div className="h-10 w-10 rounded overflow-hidden border">
                          <img src={reward.imageUrl} alt={reward.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                          N/A
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{reward.name}</TableCell>
                    <TableCell>{reward.cost} pts</TableCell>
                    <TableCell>{reward.stock !== null ? reward.stock : 'Ilimitado'}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${reward.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {reward.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reward.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(reward)} disabled={actionLoadingId === reward.rewardId}>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Editar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={actionLoadingId === reward.rewardId}>
                              {reward.isActive ? 'Desactivar' : 'Activar'}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{reward.isActive ? '¿Desactivar recompensa?' : '¿Activar recompensa?'}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {reward.isActive
                                  ? 'La recompensa ya no estará disponible para ser redimida por los usuarios.'
                                  : 'La recompensa volverá a estar disponible para los usuarios.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toggleRewardStatus(reward)}>
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={actionLoadingId === reward.rewardId}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar recompensa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción es permanente y no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-white hover:bg-destructive/90"
                                onClick={() => deleteReward(reward.rewardId)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}