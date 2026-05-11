import { drizzle } from 'drizzle-orm/neon-http';
import { getDatabase } from '@netlify/database';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

let sqlClient;
try {
  const connection = getDatabase();
  // Ensure we have a valid connection string from Netlify Database
  sqlClient = neon(connection.connectionString);
} catch (e) {
  // Fallback for local Next.js build (prevent MissingDatabaseConnectionError crash)
  sqlClient = async () => [];
}

export const db = drizzle(sqlClient, { schema });
