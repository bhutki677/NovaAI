import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { generateAIResponse } from '@/lib/ai';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, chatId, model, files } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const userId = (session.user as any).id;
    const actualModel = model || 'gemini';

    // Create or get chat
    let actualChatId = chatId;
    if (!actualChatId) {
      actualChatId = uuidv4();
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      db.run(
        'INSERT INTO chats (id, user_id, title, model) VALUES (?, ?, ?, ?)',
        [actualChatId, userId, title, actualModel]
      );
    }

    // Save user message
    const userMsgId = uuidv4();
    db.run(
      'INSERT INTO messages (id, chat_id, role, content, files) VALUES (?, ?, ?, ?, ?)',
      [userMsgId, actualChatId, 'user', message, files ? JSON.stringify(files) : null]
    );

    // Get chat history for context
    const history = db.prepare(
      'SELECT role, content FROM messages WHERE chat_id = ? ORDER BY created_at ASC LIMIT 50'
    ).all([actualChatId]) as any[];

    const conversationHistory = history.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    // Generate AI response
    const aiResponse = await generateAIResponse(
      [...conversationHistory],
      actualModel,
      files
    );

    // Save AI response
    const aiMsgId = uuidv4();
    db.run(
      'INSERT INTO messages (id, chat_id, role, content) VALUES (?, ?, ?, ?)',
      [aiMsgId, actualChatId, 'assistant', aiResponse]
    );

    // Update chat timestamp
    db.run(
      'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [actualChatId]
    );

    return NextResponse.json({
      chatId: actualChatId,
      message: {
        id: aiMsgId,
        role: 'assistant',
        content: aiResponse,
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const userId = (session.user as any).id;
    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');

    if (chatId) {
      const messages = db.prepare(
        'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC'
      ).all([chatId]);
      return NextResponse.json({ messages });
    }

    const chats = db.prepare(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC'
    ).all([userId]);
    return NextResponse.json({ chats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { chatId, title } = await req.json();
    if (!chatId || !title) {
      return NextResponse.json({ error: 'chatId and title required' }, { status: 400 });
    }

    const db = await getDatabase();
    db.run('UPDATE chats SET title = ? WHERE id = ?', [title, chatId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const chatId = url.searchParams.get('chatId');
    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    }

    const db = await getDatabase();
    db.run('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    db.run('DELETE FROM chats WHERE id = ?', [chatId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
