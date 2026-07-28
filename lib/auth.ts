import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { getDatabase } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        const db = await getDatabase();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get([credentials.email]) as any;

        if (!user) {
          throw new Error('No account found with this email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }
      if (account?.provider === 'github') {
        token.githubConnected = true;
        token.githubUsername = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).githubConnected = token.githubConnected;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'github' || account?.provider === 'google') {
        const db = await getDatabase();
        const existing = db.prepare('SELECT * FROM users WHERE email = ?').get([user.email]) as any;

        if (!existing) {
          db.run(
            'INSERT OR IGNORE INTO users (email, name, image, provider, provider_id, role) VALUES (?, ?, ?, ?, ?, ?)',
            [user.email, user.name, user.image, account.provider, account.providerAccountId, 'user']
          );
        } else if (!existing.provider) {
          db.run(
            'UPDATE users SET provider = ?, provider_id = ?, image = COALESCE(?, image) WHERE email = ?',
            [account.provider, account.providerAccountId, user.image, user.email]
          );
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
