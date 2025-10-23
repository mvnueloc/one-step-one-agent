import { connectMongo } from "./connection_mongo";

export async function saveUserLog(log: {
  name: string;
  age: number;
  budget: number;
  preferences: string;
  familyMembers?: number;
  feedback?: {
    likedCarIds?: number[];
  };
  summary?: string;
}) {
  const db = await connectMongo();
  const collection = db.collection("usersLogs");

  await collection.insertOne({
    ...log,
    createdAt: new Date()
  });
}
