import { drizzle } from 'drizzle-orm/neon-http';
import { getDatabase } from '@netlify/database';
import * as schema from './schema';

let connection;
try {
  connection = getDatabase();
} catch (e) {
  // Fallback for local Next.js build (prevent MissingDatabaseConnectionError crash)
  connection = { httpClient: async () => [] };
}
export const db = drizzle(connection.httpClient, { schema });
