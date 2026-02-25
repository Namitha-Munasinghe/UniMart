import Redis from "ioredis"
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// await client.set('foo', 'bar');
//redis is a key-value store, so we can set and get values using the set and get methods