'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RequestPointsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, amount: number) => void
  isSubmitting: boolean
}

export function RequestPointsModal({ isOpen, onClose, onSubmit, isSubmitting }: RequestPointsModalProps) {
  const [reason, setReason] = useState("")
  const [amount, setAmount] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !amount || isNaN(Number(amount))) return
    
    onSubmit(reason, Number(amount))
    // Note: We don't clear state here, we leave it to the parent to close the modal 
    // and then we could clear it, but for simplicity, we clear on successful submit in parent or here
  }

  // Effect to reset when modal opens could be added, but keeping it simple
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Puntos</DialogTitle>
          <DialogDescription>
            Envía una solicitud a tu líder para obtener puntos adicionales por tus logros o actividades especiales.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Cantidad de puntos</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              placeholder="Ej. 500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo o Justificación</Label>
            <Textarea
              id="reason"
              placeholder="Describe brevemente por qué estás solicitando estos puntos..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
              required
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !reason || !amount}>
              {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
