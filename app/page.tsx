"use client";

import { useState, useRef, useEffect } from "react";
import { ClientInfoCard } from "@/components/client-info-card";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { io } from "socket.io-client";
import { createSalesRealtimeSession, PersonalData } from "@/lib/realtime";
import { Toaster } from "sonner";
import { Spinner } from "@/components/ui/spinner";

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
  // Mantén el valor más reciente para evitar cierres obsoletos
  const recordingTimeRef = useRef(0);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const salesSessionRef = useRef<
    import("@/lib/realtime").SalesRealtimeSession | null
  >(null);

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

  // Sincroniza el ref con el valor actual para que otros módulos lean el tiempo correcto
  useEffect(() => {
    recordingTimeRef.current = recordingTime;
  }, [recordingTime]);

  const startRecording = async () => {
    try {
      // Reiniciar cronómetro al comenzar una nueva llamada
      setRecordingTime(0);
      setIsConnecting(true);
      // Crear sesión Realtime y conectar (WebRTC maneja micrófono/salida automáticamente)
      const salesSession = await createSalesRealtimeSession({
        // Exponer el tiempo actual de la llamada para guardar en saveUserFeedback (evitar cierre obsoleto)
        getRecordingTime: () => recordingTimeRef.current,
        onPersonalData: ({ name, phone, age, budget, capacity, carType }) => {
          // Guardar datos completos de la persona
          setPersonalData({ name, phone, age, budget, capacity, carType });

          setCurrentClient((prev) => ({
            name,
            company: prev?.company ?? "—",
            email: prev?.email ?? "—",
            phone: phone ?? prev?.phone ?? "—",
            lastContact: new Date().toLocaleDateString("es-ES"),
            status: prev?.status ?? "Prospecto",
          }));
        },
        onSessionEnded: () => {
          // Refrescar UI cuando el agente finaliza la llamada automáticamente
          salesSessionRef.current = null;
          setIsRecording(false);
          setIsConnecting(false);
        },
      });
      salesSessionRef.current = salesSession;
      await salesSession.connect();
      setIsRecording(true);
      setIsConnecting(false);
    } catch (error) {
      console.error("Error al grabar:", error);
      setIsConnecting(false);
    }
  };

  const stopRecording = async () => {
    try {
      await salesSessionRef.current?.stop();
    } catch (e) {
      console.warn("Error deteniendo la sesión:", e);
    } finally {
      salesSessionRef.current = null;
      setIsRecording(false);
      setIsConnecting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="modern-background" />

      <div className="min-h-screen p-3">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
          <header className="mb-4 flex shrink-0 items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-4xl">
                One Step One Agent
              </h1>
              <p className="text-[15px] text-muted-foreground">
                Agente de Ventas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="hidden md:inline-flex border-primary/20 hover:bg-primary/10">
                <Link href="/call-history">Ver historial</Link>
              </Button>
              {(isRecording || isConnecting) && (
                <div className="rounded-md bg-muted px-3 py-1.5 font-mono text-sm tabular-nums text-foreground/90">
                  {formatTime(recordingTime)}
                </div>
              )}
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                size="sm"
                disabled={isConnecting}
                aria-busy={isConnecting}
                className="h-9 min-w-[132px] whitespace-nowrap justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-80 disabled:cursor-not-allowed">
                {isRecording ? (
                  <>
                    <Square className="h-4 w-4" />
                    Detener
                  </>
                ) : isConnecting ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Conectando…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Iniciar
                  </>
                )}
              </Button>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-3 md:gap-4">
            {currentClient ? (
              <ClientInfoCard
                client={currentClient}
                personalData={personalData}
              />
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-2xl text-green-400/80">
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
