import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === 'admin';
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const db = await getDatabase();
  const keys = db.prepare('SELECT id, provider, key_value, is_active, created_at FROM api_keys ORDER BY id DESC').all();
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, key_value } = await req.json();
  if (!provider || !key_value) {
    return NextResponse.json({ error: 'Provider and key required' }, { status: 400 });
  }

  const db = await getDatabase();
  db.run('INSERT INTO api_keys (provider, key_value) VALUES (?, ?)', [provider, key_value]);

  // Also update env var behavior
  if (provider === 'gemini') {
    db.run("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)", ['GEMINI_API_KEY', key_value]);
    process.env.GEMINI_API_KEY = key_value;
  } else if (provider === 'openai') {
    db.run("INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)", ['OPENAI_API_KEY', key_value]);
    process.env.OPENAI_API_KEY = key_value;
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = await getDatabase();
  db.run('DELETE FROM api_keys WHERE id = ?', [id]);
  return NextResponse.json({ success: true });
}
