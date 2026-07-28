import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = await getDatabase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get([email]);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    db.run(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
      [email, passwordHash, name || email.split('@')[0], 'user']
    );

    return NextResponse.json({ success: true, message: 'Account created successfully' });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      debug: error?.message || String(error),
      stack: error?.stack?.split('\n').slice(0,3).join(' | ') 
    }, { status: 500 });
  }
}
