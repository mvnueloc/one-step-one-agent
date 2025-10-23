import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "../../../database/connection_mongo"; // usa tu helper actual
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { text: string, metadata: { name, age, budget, capacity, carType, feedback, etc. } }
    const {
      text,
      metadata,
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Falta el campo 'text' en el cuerpo de la solicitud" },
        { status: 400 }
      );
    }

    // Generar embedding usando OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    const embedding = embeddingResponse.data[0].embedding;
    const db = await connectMongo();
    const doc = {
      ...metadata, // name, age, budget, capacity, carType, feedback, etc.
      text, // el texto base que se embedeó
      embedding, // el vector
      createdAt: new Date(),
    };
    const result = await db.collection("feedbackEmbeddings").insertOne(doc);
    return NextResponse.json({
      message: "Embedding generado y guardado en MongoDB",
      id: result.insertedId,
      dimensions: embedding.length,
    });
  } catch (error: any) {
    console.error("Error en embed-feedback:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
