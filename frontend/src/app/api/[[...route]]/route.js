import { NextResponse } from 'next/server';
import { getDb } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// Default demo accounts
const demoUsers = [
  { nama: 'Jamaah Demo', email: 'jamaah@example.com', password: 'password123', role: 'jamaah' },
  { nama: 'Admin Travel', email: 'travel@admin.com', password: 'password123', role: 'admin_travel' },
  { nama: 'Admin Keuangan', email: 'keuangan@admin.com', password: 'password123', role: 'admin_keuangan' },
  { nama: 'Admin Perlengkapan', email: 'perlengkapan@admin.com', password: 'password123', role: 'admin_perlengkapan' }
];

async function seedDatabase() {
  try {
    const existing = await getDb().select().from(users).limit(1);
    if (existing.length === 0) {
      await getDb().insert(users).values(demoUsers);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export async function POST(req, { params }) {
  const p = await params;
  const route = p.route ? p.route.join('/') : '';

  if (route === 'login') {
    // Attempt to seed users table on first login
    await seedDatabase();

    try {
      const body = await req.json();
      const foundUser = await getDb().select().from(users).where(eq(users.email, body.email));

      if (foundUser.length > 0 && foundUser[0].password === body.password) {
        return NextResponse.json({
          success: true,
          data: {
            token: 'netlify-mock-token-1234',
            user: {
              id: foundUser[0].id,
              nama: foundUser[0].nama,
              email: foundUser[0].email,
              role: foundUser[0].role
            }
          }
        });
      }
      return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
    } catch (e) {
      return NextResponse.json({ success: false, message: e.message }, { status: 500 });
    }
  }

  // Graceful fallback for other POST endpoints
  return NextResponse.json({ success: true, data: [], message: 'Mock response' });
}

export async function GET(req, { params }) {
  // Graceful fallback for all GET endpoints to prevent dashboard crash
  return NextResponse.json({ success: true, data: [] });
}
