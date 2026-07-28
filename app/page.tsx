'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaRobot } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // No login required — send everyone straight to the chat
    router.replace('/chat');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <FaRobot className="text-white text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-white">NovaAI</h1>
        <div className="spinner w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-dark-400 text-sm">Loading your assistant…</p>
      </div>
    </div>
  );
}
