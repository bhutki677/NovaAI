'use client';

import { FaRobot, FaPlus, FaTrash, FaSignOutAlt, FaGithub, FaChevronLeft, FaTimes, FaEdit, FaCheck, FaHistory } from 'react-icons/fa';
import { Session } from 'next-auth';

interface Chat {
  id: string;
  title: string;
  model: string;
  updated_at: string;
}

interface SidebarProps {
  isOpen: boolean;
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  editingChatId: string | null;
  setEditingChatId: (id: string | null) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  onSignOut: () => void;
  session: Session | null;
}

export default function Sidebar({
  isOpen,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  editingChatId,
  setEditingChatId,
  editTitle,
  setEditTitle,
  onSignOut,
  session,
}: SidebarProps) {
  return (
    <div
      className={`${
        isOpen ? 'w-72' : 'w-0'
      } bg-dark-900 border-r border-dark-800 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}
    >
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <FaPlus />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              chat.id === currentChatId
                ? 'bg-dark-800 text-white'
                : 'text-dark-400 hover:bg-dark-800/50 hover:text-white'
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <FaHistory className="text-xs shrink-0" />

            {editingChatId === chat.id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onRenameChat(chat.id, editTitle);
                    if (e.key === 'Escape') setEditingChatId(null);
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameChat(chat.id, editTitle);
                  }}
                  className="p-1 hover:bg-dark-700 rounded text-green-400"
                >
                  <FaCheck className="text-xs" />
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm truncate">{chat.title}</span>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat.id);
                      setEditTitle(chat.title);
                    }}
                    className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-white"
                  >
                    <FaEdit className="text-xs" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-dark-700 rounded text-dark-400 hover:text-red-400"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {chats.length === 0 && (
          <div className="text-center text-dark-500 text-xs py-8">
            No chats yet. Start a conversation!
          </div>
        )}
      </div>

      {/* User Info & Footer */}
      <div className="border-t border-dark-800 p-3 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-dark-300 text-sm font-medium">
                {session?.user?.name?.[0] || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-dark-500 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={onSignOut}
            className="p-1.5 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <FaSignOutAlt className="text-sm" />
          </button>
        </div>

        {/* Instagram Credit */}
        <a
          href="https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-dark-600 hover:text-primary-400 transition-colors py-1"
        >
          Built by <span className="text-primary-500 font-medium">@vxl_404</span>
        </a>
      </div>
    </div>
  );
}
