"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Phone, Clock, Calendar, CheckCircle } from "lucide-react"
import type { CallRecord } from "@/app/page"

type CallHistoryListProps = {
  calls: CallRecord[]
  onClose: () => void
}

export function CallHistoryList({ calls, onClose }: CallHistoryListProps) {
  const handlePlayAudio = (audioBlob?: Blob) => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Historial de Llamadas</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {calls.length === 0 ? (
        <Card className="border-border/50 bg-card/50 p-12 text-center">
          <Phone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">No hay llamadas registradas todavía</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <Card
              key={call.id}
              className="border-border/50 bg-card/80 p-6 backdrop-blur-sm transition-colors hover:bg-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{call.clientName}</h3>
                      <Badge variant="outline" className="mt-1 border-primary/50 bg-primary/10 text-primary">
                        {call.callType}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {call.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {call.duration}
                    </div>
                  </div>

                  {call.actions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Accionables:</p>
                      <div className="flex flex-wrap gap-2">
                        {call.actions.map((action, index) => (
                          <Badge key={index} variant="outline" className="border-accent/50 bg-accent/10 text-accent">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {call.audioBlob && (
                  <Button
                    onClick={() => handlePlayAudio(call.audioBlob)}
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    Reproducir Audio
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
