"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Calendar, Send, CheckCircle } from "lucide-react"

type SaveCallDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (actions: string[]) => void
}

const actionOptions = [
  { id: "quote", label: "Enviar Cotización", icon: FileText },
  { id: "meeting", label: "Agendar Cita", icon: Calendar },
  { id: "email", label: "Enviar Email de Seguimiento", icon: Send },
  { id: "closed", label: "Venta Cerrada", icon: CheckCircle },
]

export function SaveCallDialog({ open, onOpenChange, onSave }: SaveCallDialogProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  const handleToggleAction = (actionId: string) => {
    setSelectedActions((prev) => (prev.includes(actionId) ? prev.filter((id) => id !== actionId) : [...prev, actionId]))
  }

  const handleSave = () => {
    onSave(selectedActions)
    setSelectedActions([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Guardar Llamada</DialogTitle>
          <DialogDescription className="text-muted-foreground">Selecciona las acciones realizadas</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <Label className="text-sm text-foreground">Accionables</Label>
          <div className="space-y-2">
            {actionOptions.map((action) => {
              const Icon = action.icon
              return (
                <div
                  key={action.id}
                  className="flex items-center space-x-2 rounded-lg border border-border/50 bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={action.id}
                    checked={selectedActions.includes(action.id)}
                    onCheckedChange={() => handleToggleAction(action.id)}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label
                    htmlFor={action.id}
                    className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {action.label}
                  </Label>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
