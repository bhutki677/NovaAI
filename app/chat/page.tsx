'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import {
  FaRobot, FaUser, FaPaperPlane, FaPlus, FaTrash, FaSignOutAlt,
  FaMicrophone, FaMicrophoneSlash, FaCog, FaGithub, FaImage,
  FaFileAlt, FaChevronLeft, FaChevronRight, FaBars, FaTimes,
  FaSun, FaMoon, FaCode, FaHistory, FaTrashAlt, FaEdit,
  FaCheck, FaTimes as FaXmark, FaDownload, FaCopy, FaShare
} from 'react-icons/fa';
import Sidebar from '@/components/Sidebar';
import ChatMessage from '@/components/ChatMessage';
import VoiceInput from '@/components/VoiceInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: string;
  created_at?: string;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  updated_at: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [model, setModel] = useState<'gemini' | 'openai'>('gemini');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Login removed — chat is open to everyone, load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      if (data.chats) setChats(data.chats);
    } catch (err) {
      console.error('Failed to load chats:', err);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chat?chatId=${chatId}`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
      setCurrentChatId(chatId);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChatId,
          model,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setMessages(prev => [...prev, data.message]);
      setCurrentChatId(data.chatId);
      loadChats();
    } catch (err) {
      toast.error('Failed to send message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!confirm('Delete this chat?')) return;
    try {
      await fetch(`/api/chat?chatId=${chatId}`, { method: 'DELETE' });
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
      loadChats();
      toast.success('Chat deleted');
    } catch (err) {
      toast.error('Failed to delete chat');
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, title: newTitle }),
      });
      loadChats();
      setEditingChatId(null);
    } catch (err) {
      toast.error('Failed to rename');
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleDownloadChat = () => {
    const text = messages
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zaro-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-dark-950 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={loadMessages}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        onSignOut={() => signOut({ callbackUrl: '/' })}
        session={session}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-dark-800 flex items-center px-4 gap-3 shrink-0 bg-dark-950/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
          </button>

          <div className="flex-1" />

          <select
            value={model}
            onChange={(e) => setModel(e.target.value as 'gemini' | 'openai')}
            className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
          >
            <option value="gemini">Gemini 2.0 Flash</option>
            <option value="openai">GPT-4o Mini</option>
          </select>

          {messages.length > 0 && (
            <button
              onClick={handleDownloadChat}
              className="p-2 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors"
              title="Download chat"
            >
              <FaDownload />
            </button>
          )}

          {(session?.user as any)?.role === 'admin' && (
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-dark-800 rounded-lg text-primary-400 hover:text-primary-300 transition-colors"
              title="Admin Dashboard"
            >
              <FaCog />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FaRobot className="text-white text-4xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">NovaAI Assistant</h1>
              <p className="text-dark-400 max-w-md mb-8">
                Your universal AI companion. Ask anything — code, explain, create, analyze.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  { icon: FaCode, text: 'Write a React component', prompt: 'Write a beautiful React signup form component with Tailwind CSS' },
                  { icon: FaImage, text: 'Create an image prompt', prompt: 'Generate a detailed image prompt for a futuristic city skyline' },
                  { icon: FaRobot, text: 'Explain a concept', prompt: 'Explain how blockchain technology works in simple terms' },
                  { icon: FaFileAlt, text: 'Debug code', prompt: 'Help me debug this error: TypeError: Cannot read properties of undefined' },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(item.prompt);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-3 bg-dark-900 border border-dark-700 rounded-xl hover:border-primary-600 transition-colors group"
                  >
                    <item.icon className="text-primary-400 mb-2 text-lg" />
                    <p className="text-white text-sm font-medium">{item.text}</p>
                    <p className="text-dark-500 text-xs mt-1 truncate">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onCopy={handleCopyMessage}
                />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 py-3 animate-fade-in">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <FaRobot className="text-white text-sm" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-typing" style={{ animationDelay: '0s' }} />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 bg-primary-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-dark-800 p-4 bg-dark-950">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 bg-dark-900 border border-dark-700 rounded-2xl p-3 focus-within:border-primary-500 transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message NovaAI..."
                rows={1}
                className="flex-1 bg-transparent resize-none text-white placeholder-dark-500 focus:outline-none max-h-32 py-1"
                style={{ minHeight: '24px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = '24px';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />

              <VoiceInput
                onResult={handleVoiceResult}
                isListening={isListening}
                setIsListening={setIsListening}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-white transition-all"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className="text-dark-500 text-xs text-center mt-2">
              NovaAI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
