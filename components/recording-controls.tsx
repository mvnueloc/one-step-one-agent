"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Square, Radio } from "lucide-react"
import { SaveCallDialog } from "@/components/save-call-dialog"
import type { Client } from "@/app/page"

type RecordingControlsProps = {
  isRecording: boolean
  recordingTime: number
  onStop: () => void
  onSave: (actions: string[]) => void
  currentClient: Client | null
  formatTime: (seconds: number) => string
}

export function RecordingControls({
  isRecording,
  recordingTime,
  onStop,
  onSave,
  currentClient,
  formatTime,
}: RecordingControlsProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const handleStopAndSave = () => {
    onStop()
    setShowSaveDialog(true)
  }

  const handleSave = (actions: string[]) => {
    onSave(actions)
    setShowSaveDialog(false)
  }

  return (
    <>
      <Card className="flex h-full flex-col justify-center border-border/50 bg-card/50 p-3 backdrop-blur-sm md:p-4">
        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
          {/* Recording Indicator - Responsive sizing */}
          <div className="relative">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all md:h-20 md:w-20 ${
                isRecording ? "recording-pulse border-primary bg-primary/10" : "border-border bg-muted/50"
              }`}
            >
              {isRecording ? (
                <Radio className="h-8 w-8 text-primary md:h-10 md:w-10" />
              ) : (
                <Mic className="h-8 w-8 text-muted-foreground md:h-10 md:w-10" />
              )}
            </div>
            {isRecording && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary md:h-6 md:w-6">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
              </div>
            )}
          </div>

          {/* Timer - Responsive sizing */}
          <div className="text-center">
            <div className="font-mono text-2xl font-bold tracking-wider text-foreground md:text-3xl">
              {formatTime(recordingTime)}
            </div>
            {isRecording && currentClient && (
              <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">Grabando con {currentClient.name}</p>
            )}
          </div>

          {/* Waveform Visualization - Responsive */}
          {isRecording && (
            <div className="flex h-8 w-full items-center justify-center gap-0.5 md:h-10">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-primary"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: `${0.5 + Math.random()}s`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Controls - Responsive button sizing */}
          <div className="flex gap-3">
            {isRecording ? (
              <Button
                onClick={handleStopAndSave}
                size="sm"
                className="gap-2 bg-destructive text-xs text-destructive-foreground hover:bg-destructive/90 md:text-sm"
              >
                <Square className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Detener y Guardar</span>
                <span className="sm:hidden">Detener</span>
              </Button>
            ) : (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground md:text-xs">Inicia una nueva llamada para comenzar</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <SaveCallDialog open={showSaveDialog} onOpenChange={setShowSaveDialog} onSave={handleSave} />
    </>
  )
}
