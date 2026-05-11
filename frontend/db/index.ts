import { drizzle } from 'drizzle-orm/neon-http';
import { getDatabase } from '@netlify/database';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

export function getDb() {
  let sqlClient;
  try {
    const connection = getDatabase();
    if (connection && connection.connectionString) {
      sqlClient = neon(connection.connectionString);
    } else {
      sqlClient = async () => [];
    }
  } catch (e) {
    sqlClient = async () => [];
  }
  return drizzle(sqlClient, { schema });
}
