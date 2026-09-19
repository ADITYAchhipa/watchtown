import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'watchtown';

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function isMongoConfigured(): boolean {
  return Boolean(uri && uri.trim().length > 0);
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!isMongoConfigured() || !uri) {
    return null;
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000,
      });
      clientPromise = client.connect();
    }
  }

  try {
    return await clientPromise;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    return null;
  }
}

export async function getMongoDb(): Promise<Db | null> {
  const mongoClient = await getMongoClient();
  if (!mongoClient) return null;
  return mongoClient.db(dbName);
}

export async function getMongoCollection<T extends import('mongodb').Document = any>(
  collectionName: string
): Promise<Collection<T> | null> {
  const db = await getMongoDb();
  if (!db) return null;
  return db.collection<T>(collectionName);
}
