import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user && (session.user as any).role === 'admin';
}

// Users CRUD
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDatabase();
  const users = db.prepare('SELECT id, email, name, role, provider, github_username, created_at FROM users ORDER BY id DESC').all();
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get('id');
  if (!userId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const db = await getDatabase();

  // Don't allow deleting yourself
  const session = await getServerSession(authOptions);
  if ((session?.user as any).id === parseInt(userId)) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  db.run('DELETE FROM messages WHERE chat_id IN (SELECT id FROM chats WHERE user_id = ?)', [userId]);
  db.run('DELETE FROM chats WHERE user_id = ?', [userId]);
  db.run('DELETE FROM users WHERE id = ?', [userId]);
  return NextResponse.json({ success: true });
}
