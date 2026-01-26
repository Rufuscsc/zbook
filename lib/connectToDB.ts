import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;


if(!uri){
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}


declare global {
  var __mongoose_cache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongoose_cache || {
  conn: null,
  promise: null,
};

/**

 * Connect to MongoDB using mongoose and return the mongoose instance.

 * Uses a global cache in development to avoid creating multiple connections

 * during hot reload.

 */

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri).then(() => {
      cache.conn = mongoose;

      return mongoose;
    });
  }

  const client = await cache.promise;

  if (process.env.NODE_ENV !== "production") global.__mongoose_cache = cache;

  return client;
}

export type MongooseInstance = typeof mongoose;