"use client";

import {
  RealtimeAgent,
  RealtimeSession,
  OpenAIRealtimeWebRTC,
  tool,
} from "@openai/agents/realtime";

import { toast } from "sonner";

import { z } from "zod";
import { carsDb, Car } from "../data/cars_db";
import { Toast } from "@radix-ui/react-toast";

export type PersonalData = {
  name: string;
  age: number;
  budget: number;
  capacity: number;
  carType: string;
  phone: string;
};

export type SalesRealtimeSession = {
  session: RealtimeSession;
  mediaStream: MediaStream;
  connect: () => Promise<void>;
  stop: () => Promise<void>;
};

export async function createSalesRealtimeSession(options?: {
  onPersonalData?: (data: PersonalData) => void;
  onSessionEnded?: () => void;
}): Promise<SalesRealtimeSession> {
  const onPersonalData = options?.onPersonalData;
  const onSessionEnded = options?.onSessionEnded;
  let requestEnd: null | (() => Promise<void>) = null;
  let resolveConnectionReady: (() => void) | null = null;
  const connectionReady = new Promise<void>((res) => {
    resolveConnectionReady = res;
  });

  // Tool para obtener catálogo de coches
  const getCarCatalog = tool({
    name: "get_car_catalog",
    description: "Return a list of cars.",
    parameters: z.object({}),
    async execute() {
      toast.success(`Buscando catálogo de coches...`);
      await connectionReady;
      // console.log(carsDb);
      return carsDb;
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
      await connectionReady;
      toast("Cita programada con éxito", {
        duration: 3000,
        position: "top-center",
      });
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
      age: z.number().describe("The age of the customer"),
      budget: z.number().describe("The budget of the customer in USD"),
      capacity: z
        .number()
        .describe("Number of people that usually travel in the car"),
      carType: z
        .string()
        .describe("The preferred car type: economical, sport, or premium"),
      feedback: z.string().describe("The feedback provided by the user"),
    }),
    async execute({ name, age, budget, capacity, carType, feedback }) {
      toast.success(`Gracias por su retroalimentación, ${name}.`);
      await connectionReady;
      console.log("User feedback:", {
        name,
        age,
        budget,
        capacity,
        carType,
        feedback,
      });

      // Embed feedback
      const feedbackText = `
        Cliente: ${name}.
        Edad: ${age} años.
        Presupuesto: ${budget} MXM.
        Capacidad deseada: ${capacity} personas.
        Tipo de coche: ${carType}.
        Feedback del cliente: ${feedback}.
      `;

      // Enviar feedback al endpoint de embed-feedback
      await fetch("/api/embed-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: feedbackText,
          metadata: { name, age, budget, capacity, carType, feedback },
        }),
      });

      return `Gracias, ${name}. Agradecemos su retroalimentación.`;
    },
  });

  const findSimilarFeedback = tool({
    name: "find_similar_feedback",
    description:
      "Busca feedbacks anteriores similares al texto actual del cliente usando embeddings almacenados en MongoDB.",
    parameters: z.object({
      queryText: z.string().describe("Texto base o feedback del cliente."),
    }),
    async execute({ queryText }) {
      await connectionReady;
      toast("Buscando feedbacks similares...", {
        duration: 2500,
        position: "top-center",
      });

      const res = await fetch("/api/search-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText }),
      });

      const data = await res.json();
      console.log("Resultados de similitud:", data);

      if (data.error) {
        return `Error: ${data.error}`;
      }

      const { matches } = data;
      if (!matches?.length) {
        return "No se encontraron retroalimentaciones similares.";
      }

      let summary = "Retroalimentaciones más similares:\n";
      for (const m of matches) {
        summary += `• ${m.name} (${m.carType}) — "${m.feedback}" (Similitud: ${m.similarity})\n`;
      }
      return summary;
    },
  });


  const endCall = tool({
    name: "end_call",
    description:
      "Finalize the current sales call and end the realtime session when conversation is complete.",
    parameters: z.object({}),
    async execute() {
      console.log("endCall called");
      toast.success(`Llamada finalizada.`);
      await connectionReady;
      try {
        await requestEnd?.();
      } catch (e) {
        console.warn("Error ending call:", e);
      }
      return "Llamada finalizada.";
    },
  });

  const setPersonalData = tool({
    name: "set_personal_data",
    description:
      "Store the personal data of the customer such as name, phone, age, budget, and preferences.",
    parameters: z.object({
      name: z.string().describe("The name of the customer"),
      phone: z.string().describe("The contact phone number of the customer"),
      age: z.number().describe("The age of the customer"),
      budget: z.number().describe("The budget of the customer in MXM"),
      capacity: z
        .number()
        .describe("Number of people that usually travel in the car"),
      carType: z
        .string()
        .describe("The preferred car type: economical, sport, or premium"),
    }),
    async execute({ name, phone, age, budget, capacity, carType }) {
      await connectionReady;
      console.log("setPersonalData called", {
        name,
        phone,
        age,
        budget,
        capacity,
        carType,
      });
      try {
        console.log("Calling onPersonalData callback");
        toast.success(`Datos personales almacenados para ${name}.`);
        onPersonalData?.({ name, phone, age, budget, capacity, carType });
      } catch (e) {
        console.warn("onPersonalData callback error:", e);
      }
      return `Datos personales almacenados para ${name}.`;
    },
  });

  const carRecommendator = new RealtimeAgent({
    name: "Car Recommendator",
    handoffDescription: "Specialist agent for car recommendations",
    instructions: `
        Eres un experto en recomendar coches de Kavak basado en las preferencias del cliente.
        Tienes acceso a una base de datos de coches y a retroalimentaciones previas de otros clientes.

        - Antes de hacer una recomendación, llama a la herramienta findSimilarFeedback usando un resumen breve
          de lo que el cliente busca (por ejemplo: "Busca un coche económico para familia de 4 personas con presupuesto 200,000 MXN").
          Esto te permitirá conocer la retroalimentación de clientes similares y mejorar tu recomendación.
        
        - Usa la herramienta getCarCatalog para ver la lista de coches disponibles.

        - Da tu recomendación basándote en el presupuesto, capacidad y tipo de coche que desea el cliente.

        - Después de recomendar un coche y que el cliente dé su opinión (por ejemplo, "me gusta", "no me convence", "está bien"),
          llama a la herramienta saveUserFeedback para registrar esa retroalimentación.

        - Cuando hayas concluido la conversación o el cliente diga que desea colgar, llama a la herramienta endCall
          para finalizar la sesión.

        Mantén siempre un tono profesional, directo y enfocado en cerrar la venta rápido,
        haciendo las preguntas necesarias para entender las necesidades del cliente en pocas frases.
    `,
    tools: [getCarCatalog, findSimilarFeedback, saveUserFeedback, endCall],
  });

  // Agente principal
  const mainAgent = new RealtimeAgent({
    name: "Andres",
    instructions: `Eres un agente de ventas de kavak y debes recopilar los datos del cliente y sus preferencias para hacer una recomendación usando el agente de recomendación de coches, Es importante que seas consiso para cerrar la venta lo mas rapido posible, el flujo seria:.
      - Saluda al cliente con "Hola, bienvenido a Kavak, mi nombre es Andres y voy a ayudarte a encontrar el coche ideal, primero que nada ¿Con quién tengo el gusto de hablar (Nombre)? "
      - Preguntar datos basicos del cliente (nombre, edad, telefono de contacto, presupuesto para el coche, capacidad de personas que suelen viajar, tipo de coche que busca) puedes hacer preguntas adicionales para obtener esta información de manera natural.
      -Guardar los datos basicos usando la tool setPersonalData cada que vayas recopilando un dato nuevo.
      - Confirma lo que el cliente busca.
      - Usa el agente de recomendación de coches para sugerir un coche basado en sus respuestas
      - Después de recomendar un coche y que le guste al cliente la opción, pregunta: "¿Qué le pareció la recomendación?"
      - Si el cliente da una respuesta positiva o dice si le gustó o no, llama a la herramienta saveUserFeedback.
      - Cuando hayas concluido la conversación (despedida incluida), llama a la herramienta endCall para finalizar la llamada, si te piden colgar tambien termina la llamada  usando la herramienta endCall.
      - si te piden colgar tambien termina la llamada  usando la herramienta end_call.
        • Considera que el presupuesto es aproximado: busca coches dentro de un rango de ±15% del presupuesto indicado.
      `,
    tools: [setPersonalData, saveUserFeedback, endCall],
    handoffs: [carRecommendator],
  });

  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  const audioElement = document.createElement("audio");
  audioElement.autoplay = true;

  const transport = new OpenAIRealtimeWebRTC({ mediaStream, audioElement });
  const session = new RealtimeSession(mainAgent, {
    transport,
    model: "gpt-realtime",
  });

  // Espera a que el canal de datos WebRTC esté realmente abierto
  const waitForRealtimeReady = async (timeoutMs = 5000) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t: any = transport as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s: any = session as any;
    const isOpen = () => {
      try {
        if (t?.dataChannel?.readyState === "open") return true;
        if (t?.isConnected === true) return true;
        if (s?.isConnected === true) return true;
      } catch {}
      return false;
    };
    if (isOpen()) return;
    await new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      // Intentar escuchar eventos si existen
      try {
        t?.once?.("open", finish);
        s?.once?.("connected", finish);
        t?.on?.("open", finish);
        s?.on?.("connected", finish);
      } catch {}
      // Fallback: polling ligero
      const poll = window.setInterval(() => {
        if (isOpen()) {
          window.clearInterval(poll);
          finish();
        }
      }, 50);
      // Timeout de seguridad
      window.setTimeout(() => {
        try {
          window.clearInterval(poll);
        } catch {}
        finish();
      }, timeoutMs);
    });
  };

  const connect = async () => {
    const res = await fetch("/api/realtime-key");
    if (!res.ok) throw new Error("No se pudo obtener clave efímera");
    const data = await res.json();
    const apiKey: string | undefined = data?.value;
    if (!apiKey) throw new Error("Respuesta sin 'value'");
    await session.connect({ apiKey });
    await waitForRealtimeReady();
    resolveConnectionReady?.();
  };

  const stop = async () => {
    // Finalizar sesión del agente y recursos de WebRTC/audio
    try {
      // Preferir disconnect si existe, luego interrupt como fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (session as any).disconnect?.();
    } catch {}
    try {
      session.interrupt?.();
    } catch {}
    try {
      mediaStream.getTracks().forEach((t) => t.stop());
    } catch {}
    try {
      // Cerrar transporte WebRTC si expone close()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (transport as any).close?.();
    } catch {}
    try {
      audioElement.pause();
      audioElement.srcObject = null;
    } catch {}
  };

  // Permitir que el agente termine la llamada vía herramienta end_call
  requestEnd = async () => {
    await stop();
    try {
      onSessionEnded?.();
    } catch {}
  };

  return { session, mediaStream, connect, stop };
}
