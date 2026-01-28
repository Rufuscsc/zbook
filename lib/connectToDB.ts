import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global cache prevents multiple connections during hot-reloading in development.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongoose_cache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongoose_cache || {
  conn: null,
  promise: null,
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  // 1. If we already have a successful connection, return it immediately.
  if (cache.conn) return cache.conn;

  // 2. If no connection attempt is in progress, start one.
  if (!cache.promise) {
    const opts = {
      bufferCommands: false, // Fix: Prevents 10s "buffering" lag by failing fast if down.
    };

    cache.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB Connection Established");
        cache.conn = mongooseInstance;
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("❌ MongoDB Connection Error:", err.message);
        cache.promise = null;
        throw err;
      });
  }

  // 3. Wait for the connection to finalize.
  try {
    const client = await cache.promise;
    
    // Persist the cache in development mode.
    if (process.env.NODE_ENV !== "production") {
      global.__mongoose_cache = cache;
    }

    return client;
  } catch (error) {
    cache.promise = null; // Ensure we don't cache a failed promise.
    throw error;
  }
}

export type MongooseInstance = typeof mongoose;