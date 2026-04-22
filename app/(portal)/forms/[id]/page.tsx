'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { EmbeddedForm } from '@/components/forms/EmbeddedForm'
import { DynamicForm } from '@/components/forms/DynamicForm'
import { useForm } from '@/hooks/useForms'

interface FormPageProps {
  params: Promise<{ id: string }>
}

export default function FormPage({ params }: FormPageProps) {
  const { id } = use(params)
  const { data: form, isLoading, error } = useForm(id)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !form) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/forms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a formularios
          </Link>
        </Button>
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">No se pudo cargar el formulario.</p>
            <p className="text-sm text-muted-foreground">
              El formulario puede no existir o no tienes acceso.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/forms">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a formularios
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          <CardDescription>{form.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {form.type === 'embedded' && form.embedUrl ? (
            <EmbeddedForm url={form.embedUrl} title={form.title} />
          ) : form.type === 'native' && form.schema ? (
            <DynamicForm formId={form.id} schema={form.schema} />
          ) : (
            <p className="text-center text-muted-foreground">
              Tipo de formulario no soportado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
