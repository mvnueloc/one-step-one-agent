import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/database/connection_mongo";

export async function GET() {
  try {
    const db = await connectMongo();
    const items = await db
      .collection("feedback")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, budget, capacity, carType, feedback, durationSeconds } =
      body || {};

    // Validación mínima
    if (
      !name ||
      typeof name !== "string" ||
      typeof age !== "number" ||
      typeof budget !== "number" ||
      typeof capacity !== "number" ||
      !carType ||
      typeof carType !== "string" ||
      !feedback ||
      typeof feedback !== "string"
    ) {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const db = await connectMongo();
    const doc = {
      name,
      age,
      budget,
      capacity,
      carType,
      feedback,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : null,
      createdAt: new Date(),
    };
    const result = await db.collection("feedback").insertOne(doc);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
