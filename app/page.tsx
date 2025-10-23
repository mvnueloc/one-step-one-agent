"use client";

import { useState, useRef, useEffect } from "react";
import { ClientInfoCard } from "@/components/client-info-card";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { io } from "socket.io-client";
import { createSalesRealtimeSession, type SalesSession } from "@/lib/realtime";
import { Toaster } from "sonner";

export type CallRecord = {
  id: string;
  clientName: string;
  callType: string;
  date: string;
  duration: string;
  actions: string[];
  audioBlob?: Blob;
};

export type Client = {
  name: string;
  company: string;
  email: string;
  phone: string;
  lastContact: string;
  status: string;
};

export default function SalesAgentRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  const realtimeRef = useRef<SalesSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Crear sesión Realtime y conectar (WebRTC maneja micrófono/salida automáticamente)
      const salesSession = await createSalesRealtimeSession({
        onPersonalData: ({ name }) => {
          setCurrentClient((prev) => ({
            name,
            company: prev?.company ?? "—",
            email: prev?.email ?? "—",
            phone: prev?.phone ?? "—",
            lastContact: new Date().toLocaleDateString("es-ES"),
            status: prev?.status ?? "Prospecto",
          }));
        },
      });
      realtimeRef.current = salesSession;
      await salesSession.connect();
      setIsRecording(true);
    } catch (error) {
      console.error("Error al grabar:", error);
    }
  };

  const stopRecording = () => {
    if (realtimeRef.current) {
      realtimeRef.current.stop();
      realtimeRef.current = null;
    }
    setIsRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <>
      <Toaster />
      <div className="modern-background" />

      <div className="min-h-screen p-3">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
          <header className="mb-4 flex shrink-0 items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-2xl">
                Grabación en tiempo real
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Agente de Ventas
              </p>
            </div>
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="sm"
              className="h-9 gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  Detener
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </Button>
          </header>

          <main className="flex flex-1 flex-col gap-3 md:gap-4">
            {currentClient ? (
              <ClientInfoCard client={currentClient} />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Presiona Iniciar y proporciona tus datos cuando el agente te
                  los pida.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
