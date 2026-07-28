'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FaUsers, FaRobot, FaDatabase, FaCog, FaArrowLeft,
  FaTrash, FaEdit, FaSave, FaKey, FaGithub, FaChartBar,
  FaComments, FaUserShield, FaServer, FaSync
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, chats: 0, messages: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newApiKey, setNewApiKey] = useState({ provider: 'gemini', key_value: '' });
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (session && (session.user as any)?.role !== 'admin') {
      router.push('/chat');
      toast.error('Access denied. Admin only.');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session && (session.user as any)?.role === 'admin') {
      loadData();
    }
  }, [session, activeTab]);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, configRes, keysRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/config'),
        fetch('/api/admin/api-keys'),
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const configData = await configRes.json();
      const keysData = await keysRes.json();

      setStats(statsData);
      setUsers(usersData.users || []);
      setConfig(configData.config || {});
      setApiKeys(keysData.keys || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const handleAddApiKey = async () => {
    if (!newApiKey.key_value) return;
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApiKey),
      });
      if (res.ok) {
        toast.success('API key added');
        setNewApiKey({ provider: 'gemini', key_value: '' });
        loadData();
      }
    } catch (err) {
      toast.error('Failed to add API key');
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    try {
      await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' });
      toast.success('API key deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleSaveConfig = async () => {
    if (!newConfigKey || !newConfigValue) return;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newConfigKey, value: newConfigValue }),
      });
      toast.success('Config saved');
      setNewConfigKey('');
      setNewConfigValue('');
      loadData();
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      toast.success('User deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-950">
        <div className="spinner w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const adminEmail = 'admin@novaai.com';

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Admin Sidebar */}
      <div className="w-64 bg-dark-900 border-r border-dark-800 flex flex-col">
        <div className="p-4 border-b border-dark-800">
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-3"
          >
            <FaArrowLeft /> Back to Chat
          </button>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUserShield className="text-primary-400" /> Admin Panel
          </h2>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: 'overview', icon: FaChartBar, label: 'Overview' },
            { id: 'users', icon: FaUsers, label: 'Users' },
            { id: 'api-keys', icon: FaKey, label: 'API Keys' },
            { id: 'settings', icon: FaCog, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-white'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-dark-800">
          <div className="bg-dark-800 rounded-lg p-3 text-xs">
            <p className="text-dark-400 mb-1">Admin Email:</p>
            <code className="text-primary-400 select-all">{adminEmail}</code>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Users', value: stats.users, icon: FaUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Total Chats', value: stats.chats, icon: FaComments, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Total Messages', value: stats.messages, icon: FaServer, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-dark-900 border border-dark-700 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                      <stat.icon className={stat.color} />
                    </div>
                    <div>
                      <p className="text-dark-400 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-2">Admin Information</h3>
              <p className="text-dark-400 text-sm">
                Welcome to the NovaAI admin dashboard. Use the sidebar to manage users, API keys, and system settings.
              </p>
              <p className="text-dark-500 text-xs mt-3">
                Built by <a href="https://www.instagram.com/vxl_404?igsh=cTJ6a2E4b3gxZ2Ny" target="_blank" className="text-primary-400">@vxl_404</a>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>
            <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">Provider</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                      <td className="px-4 py-3 text-white text-sm">{user.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{user.name}</td>
                      <td className="px-4 py-3 text-dark-300 text-sm">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-dark-400 text-sm">{user.provider || 'email'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-dark-400 hover:text-red-400"
                          title="Delete user"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">API Key Management</h1>

            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Add New API Key</h3>
              <div className="flex gap-3">
                <select
                  value={newApiKey.provider}
                  onChange={(e) => setNewApiKey({ ...newApiKey, provider: e.target.value })}
                  className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="gemini">Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="github">GitHub</option>
                </select>
                <input
                  type="text"
                  value={newApiKey.key_value}
                  onChange={(e) => setNewApiKey({ ...newApiKey, key_value: e.target.value })}
                  placeholder="Enter API key..."
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleAddApiKey}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Key
                </button>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-700">
                    <th className="text-left px-4 py-3 text-dark-400 text-sm">ID</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm">Provider</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm">Key</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm">Status</th>
                    <th className="text-left px-4 py-3 text-dark-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key: any) => (
                    <tr key={key.id} className="border-b border-dark-800">
                      <td className="px-4 py-3 text-white text-sm">{key.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{key.provider}</td>
                      <td className="px-4 py-3 text-dark-300 text-sm font-mono">
                        {key.key_value?.substring(0, 20)}...
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          key.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-dark-400 hover:text-red-400"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">System Settings</h1>

            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Add Config</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newConfigKey}
                  onChange={(e) => setNewConfigKey(e.target.value)}
                  placeholder="Config key"
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
                />
                <input
                  type="text"
                  value={newConfigValue}
                  onChange={(e) => setNewConfigValue(e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm"
                />
                <button
                  onClick={handleSaveConfig}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <FaSave className="inline mr-1" /> Save
                </button>
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Current Configuration</h3>
              <div className="space-y-2">
                {Object.entries(config).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-dark-800 rounded-lg px-4 py-2.5">
                    <span className="text-dark-300 text-sm font-mono">{key}</span>
                    <span className="text-white text-sm">{value}</span>
                  </div>
                ))}
                {Object.keys(config).length === 0 && (
                  <p className="text-dark-500 text-sm">No custom configuration set.</p>
                )}
              </div>
            </div>

            <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 mt-6">
              <h3 className="text-white font-semibold mb-4">Environment Info</h3>
              <div className="space-y-2 text-sm">
                <p className="text-dark-400">
                  <span className="text-dark-500">App:</span>{' '}
                  <code className="text-white">NovaAI v1.0</code>
                </p>
                <p className="text-dark-400">
                  <span className="text-dark-500">Built by:</span>{' '}
                  <code className="text-primary-400">@vxl_404</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
