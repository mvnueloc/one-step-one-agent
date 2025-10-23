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
  capacity: number;
  carType: string;
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

  const saveUserFeedback = tool({
    name: "save_user_feedback",
    description: "Store the customer's feedback about a recommendation.",
    parameters: z.object({
      name: z.string().describe("The name of the customer"),
      feedback: z.string().describe("The feedback provided by the user"),
      rating: z.number().min(1).max(5).nullable()
        .describe("Numeric rating from 1 (bad) to 5 (excellent)"),
    }),
    async execute({ name, feedback, rating }) {
      console.log("User feedback:", { name, feedback, rating });
      
      // Llamar a API backend para procesar y guardar embeddings
      // await fetch("/api/store-feedback", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ name, feedback, rating }),
      // });

      return `Gracias, ${name}. Agradecemos su retroalimentación.`;
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
      capacity: z.number().describe("Number of people that usually travel in the car"),
      carType: z.string().describe("The preferred car type: economical, sport, or premium"),
    }),
    async execute({ name, age, budget, capacity, carType }) {
      console.log("setPersonalData called", { name, age, budget, capacity, carType });
      try {
        onPersonalData?.({ name, age, budget, capacity, carType });
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
      - Pregunta cuántas personas suelen viajar (capacidad)
      - Pregunta si busca algo económico, deportivo o familiar
      - Confirma lo que el cliente busca.
      - Llamar a la tool setPersonalData para almacenar los datos
      - Usa el agente de recomendación de coches para sugerir un coche basado en sus respuestas
        • Considera que el presupuesto es aproximado: busca coches dentro de un rango de ±15% del presupuesto indicado.
      - Después de recomendar un coche, pregunta: "¿Qué tan útil le pareció esta recomendación del 1 al 5?"
      - Si el cliente da una respuesta o dice si le gustó o no, llama a la herramienta save_user_feedback.
      - Usa la respuesta del cliente para ajustar futuras sugerencias (por ejemplo, si dice 'muy caro', prioriza autos más económicos la próxima vez).
      - Mantén siempre un tono profesional, claro y orientado al cierre de venta rápido.
      `,
    tools: [setPersonalData, saveUserFeedback],
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
