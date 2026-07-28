'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaGithub, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaRobot, FaMicrophone, FaCode, FaImage, FaFileAlt, FaBrain } from 'react-icons/fa';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success('Welcome back! 👋');
          router.push('/chat');
        }
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success('Account created! 🎉');
          await signIn('credentials', { email, password, redirect: false });
          router.push('/chat');
        }
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/chat' });
  };

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/chat' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="spinner w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col lg:flex-row">
      {/* Left - Info Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaRobot className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-white">NovaAI</h1>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Your Universal<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">
              AI Assistant
            </span>
          </h2>
          <p className="text-dark-300 text-lg max-w-md">
            Chat, code, create images, analyze files, build apps — all in one place. Powered by the most advanced AI models.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: FaBrain, text: 'Advanced AI Chat with Memory' },
              { icon: FaCode, text: 'Code Generation & Debugging' },
              { icon: FaImage, text: 'Image Generation & Analysis' },
              { icon: FaFileAlt, text: 'File Upload & Processing' },
              { icon: FaMicrophone, text: 'Voice Input Support' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-300 animate-fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <item.icon className="text-primary-400 text-lg" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-dark-400 text-sm">
          <p>Trusted by developers, creators, and professionals worldwide.</p>
        </div>
      </div>

      {/* Right - Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">NovaAI</h1>
          </div>

          <div className="bg-dark-900 border border-dark-700 rounded-2xl p-8">
            <div className="flex mb-8 bg-dark-800 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                  isLogin ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-all ${
                  !isLogin ? 'bg-dark-700 text-white shadow-sm' : 'text-dark-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="John Doe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-lg py-2.5 pl-10 pr-10 text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Processing...
                  </span>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-dark-700" />
              <span className="text-dark-500 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-dark-700" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGitHubLogin}
                className="flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg py-2.5 text-white transition-colors"
              >
                <FaGithub className="text-lg" />
                GitHub
              </button>
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg py-2.5 text-white transition-colors"
              >
                <FaGoogle className="text-lg" />
                Google
              </button>
            </div>
          </div>

          {/* Instagram Credit */}
          <div className="mt-6 text-center">
            <a
              href="https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-500 hover:text-primary-400 text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <span>Built by</span>
              <span className="text-primary-400 font-medium">@vxl_404</span>
              <span>on Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
