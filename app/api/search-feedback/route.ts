import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "../../../database/connection_mongo";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Función auxiliar para calcular similitud coseno
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

export async function POST(req: NextRequest) {
  try {
    const { queryText } = await req.json(); // { queryText: string }
    if (!queryText)
      return NextResponse.json({ error: "Falta el campo queryText" }, { status: 400 });

    // Crear embedding del texto actual
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: queryText,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Conectar a Mongo
    const db = await connectMongo();
    const feedbacks = await db.collection("feedbackEmbeddings").find({}).toArray();

    // Calcular similitud coseno
    const results = feedbacks.map((fb: any) => {
      const similarity = cosineSimilarity(queryEmbedding, fb.embedding);
      return { ...fb, similarity };
    });

    // Ordenar de mayor a menor similitud
    results.sort((a, b) => b.similarity - a.similarity);

    // Retornar los top 3
    const topMatches = results.slice(0, 3);

    return NextResponse.json({
      matches: topMatches.map((m) => ({
        name: m.name,
        feedback: m.feedback,
        similarity: m.similarity.toFixed(3),
        carType: m.carType,
      })),
    });
  } catch (error: any) {
    console.error("Error en /api/search-feedback:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}