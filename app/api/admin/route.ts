import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

// Middleware check
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') {
    return false;
  }
  return true;
}

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDatabase();
  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path.endsWith('/stats')) {
      const users = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
      const chats = (db.prepare('SELECT COUNT(*) as count FROM chats').get() as any).count;
      const messages = (db.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count;
      return NextResponse.json({ users, chats, messages });
    }

    if (path.endsWith('/users')) {
      const users = db.prepare('SELECT id, email, name, role, provider, created_at FROM users ORDER BY id DESC').all();
      return NextResponse.json({ users });
    }

    if (path.endsWith('/config')) {
      const config = db.prepare('SELECT * FROM system_config').all() as any[];
      const configObj: Record<string, string> = {};
      config.forEach((c: any) => { configObj[c.key] = c.value; });
      return NextResponse.json({ config: configObj });
    }

    if (path.endsWith('/api-keys')) {
      const keys = db.prepare('SELECT id, provider, key_value, is_active FROM api_keys ORDER BY id DESC').all();
      return NextResponse.json({ keys });
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
