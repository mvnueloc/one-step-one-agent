import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Phone, Calendar, User } from "lucide-react"
import type { Client } from "@/app/page"

type ClientInfoCardProps = {
  client: Client
}

export function ClientInfoCard({ client }: ClientInfoCardProps) {
  return (
    <Card className="shrink-0 border-primary/20 bg-card/80 p-3 backdrop-blur-sm md:p-4">
      <div className="mb-2 flex items-start justify-between md:mb-3">
        <h3 className="text-sm font-semibold text-foreground md:text-base">Información del Cliente</h3>
        <Badge variant="outline" className="border-primary/50 bg-primary/10 text-[10px] text-primary md:text-xs">
          {client.status}
        </Badge>
      </div>

      <div className="space-y-2 md:space-y-2.5">
        <div className="flex items-start gap-2">
          <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground md:text-xs">Nombre</p>
            <p className="truncate text-xs font-medium text-foreground md:text-sm">{client.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground md:text-xs">Empresa</p>
            <p className="truncate text-xs font-medium text-foreground md:text-sm">{client.company}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground md:text-xs">Email</p>
            <p className="truncate text-xs font-medium text-foreground md:text-sm">{client.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground md:text-xs">Teléfono</p>
            <p className="text-xs font-medium text-foreground md:text-sm">{client.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground md:text-xs">Último Contacto</p>
            <p className="text-xs font-medium text-foreground md:text-sm">{client.lastContact}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
