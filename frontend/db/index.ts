import { drizzle } from '@netlify/database';
import * as schema from './schema';

export const db = drizzle({ schema });
