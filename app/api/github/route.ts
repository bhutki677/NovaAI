import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

// Save GitHub token for user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, username } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'GitHub token required' }, { status: 400 });
    }

    const db = await getDatabase();
    const userId = (session.user as any).id;

    db.run(
      'UPDATE users SET github_token = ?, github_username = ? WHERE id = ?',
      [token, username || null, userId]
    );

    return NextResponse.json({ success: true, message: 'GitHub connected successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get GitHub repos for connected user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const userId = (session.user as any).id;

    const user = db.prepare('SELECT github_token, github_username FROM users WHERE id = ?').get([userId]) as any;

    if (!user?.github_token) {
      return NextResponse.json({ connected: false, repos: [] });
    }

    // Fetch repos from GitHub API
    const response = await fetch('https://api.github.com/user/repos?per_page=50&sort=updated', {
      headers: {
        Authorization: `Bearer ${user.github_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      // Token expired or invalid - clear it
      db.run('UPDATE users SET github_token = NULL, github_username = NULL WHERE id = ?', [userId]);
      return NextResponse.json({ connected: false, repos: [], error: 'GitHub token expired' });
    }

    const repos = await response.json();
    const simplifiedRepos = repos.map((r: any) => ({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      url: r.html_url,
      private: r.private,
      updated_at: r.updated_at,
    }));

    return NextResponse.json({
      connected: true,
      username: user.github_username,
      repos: simplifiedRepos,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Disconnect GitHub
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const userId = (session.user as any).id;

    db.run('UPDATE users SET github_token = NULL, github_username = NULL WHERE id = ?', [userId]);

    return NextResponse.json({ success: true, message: 'GitHub disconnected' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
