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
  const config = db.prepare('SELECT * FROM system_config').all() as any[];
  const configObj: Record<string, string> = {};
  config.forEach((c: any) => { configObj[c.key] = c.value; });
  return NextResponse.json({ config: configObj });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

  const db = await getDatabase();
  db.run('INSERT OR REPLACE INTO system_config (key, value) VALUES (?, ?)', [key, value]);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (!key) return NextResponse.json({ error: 'Key required' }, { status: 400 });

  const db = await getDatabase();
  db.run('DELETE FROM system_config WHERE key = ?', [key]);
  return NextResponse.json({ success: true });
}
