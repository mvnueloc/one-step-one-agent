import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "../../../database/connection_mongo";

export async function GET() {
  try {
    const db = await connectMongo();
    const users = await db.collection("usersInfo").find({}).toArray();
    return NextResponse.json(users);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { name, age, budget, preferences, familyMembers, feedback }
    const db = await connectMongo();
    const result = await db.collection("usersInfo").insertOne(body);
    return NextResponse.json({ insertedId: result.insertedId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
