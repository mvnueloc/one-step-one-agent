"use client";

import {
  RealtimeAgent,
  RealtimeSession,
  OpenAIRealtimeWebRTC,
  tool,
} from "@openai/agents/realtime";
import { z } from "zod";

export type SalesSession = {
  session: RealtimeSession;
  mediaStream: MediaStream;
  connect: () => Promise<void>;
  stop: () => void;
};

export type PersonalData = {
  name: string;
  age: number;
  budget: number;
  preferences: string;
};

/**
 * Crea el agente principal y la sesión Realtime, configura micrófono/salida con WebRTC
 * y devuelve utilidades para conectar y detener.
 * Importante: en producción usa una clave efímera desde /api/realtime-key (no expongas tu sk_ en cliente).
 */
export async function createSalesRealtimeSession(options?: {
  onPersonalData?: (data: PersonalData) => void;
}): Promise<SalesSession> {
  const onPersonalData = options?.onPersonalData;
  // Tools de ejemplo basadas en tu snippet
  const getCarCatalog = tool({
    name: "get_car_catalog",
    description: "Return a list of cars.",
    parameters: z.object({}),
    async execute() {
      return [
        {
          id: 1,
          make: "Toyota",
          model: "Camaro",
          type: "Deportivo",
          capacity: 2,
        },
        { id: 2, make: "Honda", model: "Accord", type: "Sedán", capacity: 5 },
      ];
    },
  });

  const toScheduleAppointment = tool({
    name: "schedule_appointment",
    description:
      "Schedule an appointment with a sales agent based on the customer's preferences and availability.",
    parameters: z.object({
      name: z.string().describe("The name of the customer"),
      date: z.string().describe("The preferred date for the appointment"),
      time: z.string().describe("The preferred time for the appointment"),
    }),
    async execute({ name, date, time }) {
      console.log("scheduleAppointment called", { name, date, time });
      // Aquí podrías integrar con un sistema real de agendamiento
      return `Cita programada para ${name} el ${date} a las ${time}.`;
    },
  });

  const setPersonalData = tool({
    name: "set_personal_data",
    description:
      "Store the personal data of the customer such as name, age, budget, and preferences.",
    parameters: z.object({
      name: z.string().describe("The name of the customer"),
      age: z.number().describe("The age of the customer"),
      budget: z.number().describe("The budget of the customer in USD"),
      preferences: z.string().describe("The car preferences of the customer"),
    }),
    async execute({ name, age, budget, preferences }) {
      console.log("setPersonalData called", { name, age, budget, preferences });
      try {
        onPersonalData?.({ name, age, budget, preferences });
      } catch (e) {
        console.warn("onPersonalData callback error:", e);
      }
      return `Datos personales almacenados para ${name}.`;
    },
  });

  const carRecommendator = new RealtimeAgent({
    name: "Car Recommendator",
    handoffDescription: "Specialist agent for car recommendations",
    instructions:
      "Siempre debes de recomendar un coche basado en las preferencias del usuario. Haz preguntas para entender mejor sus necesidades antes de hacer una recomendación. Solo puedes recomendar coches del catálogo proporcionado por la herramienta getCarCatalog.",
    tools: [getCarCatalog],
  });

  const mainAgent = new RealtimeAgent({
    name: "Andres",
    instructions: `Eres un agente de ventas de kavak y debes recopilar los datos del cliente y sus preferencias para hacer una recomendación usando el agente de recomendación de coches, Es importante que seas consiso para cerrar la venta lo mas rapido posible, el flujo seria:.
      - Saluda al cliente
      - Preguntar datos basicos del cliente (nombre, edad, presupuesto)
      - Pregunta por sus preferencias (tipo de coche, capacidad, presupuesto)
      - Llamar a la tool setPersonalData para almacenar los datos
      - Usa el agente de recomendación de coches para sugerir un coche basado en sus respuestas
      - Cierra la venta de manera efectiva y rápida.
      `,
    tools: [setPersonalData],
    handoffs: [carRecommendator],
  });

  // Preparamos media stream y transporte WebRTC para controlar el micrófono local
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const audioElement = document.createElement("audio");
  audioElement.autoplay = true; // reproducir respuestas del agente

  const transport = new OpenAIRealtimeWebRTC({ mediaStream, audioElement });
  const session = new RealtimeSession(mainAgent, {
    transport,
    model: "gpt-realtime",
  });

  const connect = async () => {
    // Solicita clave efímera a tu backend
    const res = await fetch("/api/realtime-key");
    if (!res.ok) throw new Error("No se pudo obtener clave efímera");
    const data = await res.json();
    const apiKey: string | undefined = data?.value;
    if (!apiKey) throw new Error("Respuesta sin 'value' de clave efímera");
    await session.connect({ apiKey });
  };

  const stop = () => {
    // Interrumpe y libera micrófono
    try {
      session.interrupt();
    } catch {}
    try {
      mediaStream.getTracks().forEach((t) => t.stop());
    } catch {}
  };

  return { session, mediaStream, connect, stop };
}
