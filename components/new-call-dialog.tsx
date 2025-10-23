"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client } from "@/app/page"

type NewCallDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartCall: (client: Client, callType: string) => void
}

const mockClients: Client[] = [
  {
    name: "María González",
    company: "Tech Solutions SA",
    email: "maria.gonzalez@techsolutions.com",
    phone: "+52 55 1234 5678",
    lastContact: "15/10/2025",
    status: "Activo",
  },
  {
    name: "Carlos Ramírez",
    company: "Innovación Digital",
    email: "carlos.ramirez@innovacion.com",
    phone: "+52 55 8765 4321",
    lastContact: "20/10/2025",
    status: "Prospecto",
  },
  {
    name: "Ana Martínez",
    company: "Grupo Empresarial MX",
    email: "ana.martinez@grupomx.com",
    phone: "+52 55 9876 5432",
    lastContact: "18/10/2025",
    status: "Activo",
  },
]

const callTypes = ["Seguimiento", "Prospección", "Cierre de Venta", "Soporte", "Renovación", "Consulta"]

export function NewCallDialog({ open, onOpenChange, onStartCall }: NewCallDialogProps) {
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [selectedCallType, setSelectedCallType] = useState<string>("")

  const handleStart = () => {
    const client = mockClients.find((c) => c.name === selectedClient)
    if (client && selectedCallType) {
      onStartCall(client, selectedCallType)
      setSelectedClient("")
      setSelectedCallType("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border/50 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nueva Llamada</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona el cliente y el tipo de llamada para comenzar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="client" className="text-foreground">
              Cliente
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client" className="bg-muted/50">
                <SelectValue placeholder="Selecciona un cliente" />
              </SelectTrigger>
              <SelectContent>
                {mockClients.map((client) => (
                  <SelectItem key={client.email} value={client.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.company}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="call-type" className="text-foreground">
              Tipo de Llamada
            </Label>
            <Select value={selectedCallType} onValueChange={setSelectedCallType}>
              <SelectTrigger id="call-type" className="bg-muted/50">
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                {callTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border/50">
            Cancelar
          </Button>
          <Button
            onClick={handleStart}
            disabled={!selectedClient || !selectedCallType}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Iniciar Llamada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
