// database/connection_mongo.ts
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://antoniostuydszn_db_user:A2HUSXxUC8r6lHtq@kavakhackathon.ccko9g8.mongodb.net/?appName=KavakHackathon";

let client: MongoClient;

export async function connectMongo() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("KavakUsersInfo");
}
