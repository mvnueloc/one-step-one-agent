"use client";

import { RealtimeAgent, RealtimeSession, OpenAIRealtimeWebRTC, tool } from "@openai/agents/realtime";
import { z } from "zod";
import { carsDb, Car } from "../data/cars_db";

export type PersonalData = {
  name: string;
  age: number;
  budget: number;
  preferences: string;
  familyMembers?: number;
};

type FeedbackRecord = {
  profileKey: string; // e.g., "family_4"
  likedCarIds: number[];
  dislikedCarIds: number[];
};

export class SalesAgentMemory {
  private feedback: FeedbackRecord[] = [];

  addFeedback(profileKey: string, carId: number, liked: boolean) {
    let record = this.feedback.find(f => f.profileKey === profileKey);
    if (!record) {
      record = { profileKey, likedCarIds: [], dislikedCarIds: [] };
      this.feedback.push(record);
    }
    if (liked) record.likedCarIds.push(carId);
    else record.dislikedCarIds.push(carId);
  }

  getPreferredCars(profileKey: string): number[] {
    const record = this.feedback.find(f => f.profileKey === profileKey);
    return record?.likedCarIds || [];
  }
}

export type SalesSession = {
  session: RealtimeSession;
  mediaStream: MediaStream;
  connect: () => Promise<void>;
  stop: () => void;
  memory: SalesAgentMemory;
};

export async function createSalesRealtimeSession(options?: {
  onPersonalData?: (data: PersonalData) => void;
}) {
  const onPersonalData = options?.onPersonalData;
  const memory = new SalesAgentMemory();

  // Tool para obtener catálogo de coches
  const getCarCatalog = tool({
    name: "get_car_catalog",
    description: "Return a list of cars.",
    parameters: z.object({}),
    async execute() {
      console.log(carsDb);
      return carsDb;
    }
  });

// Tool para almacenar datos personales y feedback
const setPersonalData = tool({
  name: "set_personal_data",
  description: "Store personal data + feedback",
  parameters: z.object({
    name: z.string(),
    age: z.number(),
    budget: z.number(),
    preferences: z.string(),
    familyMembers: z.number().nullable(),  // Cambiado de .optional() a .nullable()
    likedCarId: z.number().nullable(),      // Cambiado de .optional() a .nullable()
    liked: z.boolean().nullable()           // Cambiado de .optional() a .nullable()
  }),
  async execute({ name, age, budget, preferences, familyMembers, likedCarId, liked }) {
    onPersonalData?.({ name, age, budget, preferences, familyMembers: familyMembers ?? undefined });
    if (familyMembers && likedCarId && liked !== undefined && liked !== null) {
      const profileKey = `family_${familyMembers}`;
      memory.addFeedback(profileKey, likedCarId, liked);
    }
    return `Datos personales almacenados para ${name}.`;
  }
});

  // Agente recomendador que usa feedback histórico
  const carRecommendator = new RealtimeAgent({
    name: "Car Recommendator",
    handoffDescription: "Specialist agent for car recommendations",
    instructions: `
      Recomendaciones basadas en la base de datos de coches.
      Considera el feedback previo de clientes similares (familias, solteros, etc.).
      Haz preguntas para entender necesidades antes de recomendar.
      Siempre ofrece coches apropiados según perfil y capacidad.
    `,
    tools: [getCarCatalog]
  });

  // Agente principal
  const mainAgent = new RealtimeAgent({
    name: "Andres",
    instructions: `
      Eres un agente de ventas. Debes recopilar los datos del cliente, generar recomendación de coches y preguntar feedback.
      Flujo:
      1. Saluda al cliente
      2. Pregunta datos básicos (nombre, edad, presupuesto, cuántas personas viajan)
      3. Llama a setPersonalData para almacenar datos
      4. Usa carRecommendator para sugerir coche
      5. Pregunta si le gustó (feedback)
      6. Actualiza memoria para mejorar futuras recomendaciones
    `,
    tools: [setPersonalData],
    handoffs: [carRecommendator]
  });

  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioElement = document.createElement("audio");
  audioElement.autoplay = true;

  const transport = new OpenAIRealtimeWebRTC({ mediaStream, audioElement });
  const session = new RealtimeSession(mainAgent, { transport, model: "gpt-realtime" });

  const connect = async () => {
    const res = await fetch("/api/realtime-key");
    if (!res.ok) throw new Error("No se pudo obtener clave efímera");
    const data = await res.json();
    const apiKey: string | undefined = data?.value;
    if (!apiKey) throw new Error("Respuesta sin 'value'");
    await session.connect({ apiKey });
  };

  const stop = () => {
    try { session.interrupt(); } catch {}
    try { mediaStream.getTracks().forEach(t => t.stop()); } catch {}
  };

  return { session, mediaStream, connect, stop, memory };
}
