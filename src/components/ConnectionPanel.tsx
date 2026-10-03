import { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { ConnectionConfig } from '../types/mqtt';
import { Wifi, WifiOff, Loader2, Server, Key, User, Hash, Shield } from 'lucide-react';

export default function ConnectionPanel() {
  const { connected, connecting, config, connect, disconnect } = useMqtt();
  const [form, setForm] = useState<ConnectionConfig>({
    host: config.host || 'broker.emqx.io',
    port: config.port || 8083,
    clientId: config.clientId || `mqtt_mgr_${Math.random().toString(16).substring(2, 8)}`,
    username: config.username || '',
    password: config.password || '',
    useSSL: config.useSSL || false,
    cleanSession: config.cleanSession ?? true,
    keepAlive: config.keepAlive || 60,
  });

  const handleConnect = () => {
    if (connected) {
      disconnect();
    } else {
      connect(form);
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" />
          Подключение к брокеру
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          connected ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          connecting ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {connected ? <Wifi className="w-4 h-4" /> : connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <WifiOff className="w-4 h-4" />}
          {connected ? 'Подключено' : connecting ? 'Подключение...' : 'Отключено'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Хост</label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.host}
              onChange={e => setForm({ ...form, host: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="broker.emqx.io"
              disabled={connected}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Порт</label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={form.port}
              onChange={e => setForm({ ...form, port: parseInt(e.target.value) || 8083 })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="8083"
              disabled={connected}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Client ID</label>
          <input
            type="text"
            value={form.clientId}
            onChange={e => setForm({ ...form, clientId: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
            disabled={connected}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Keep Alive (сек)</label>
          <input
            type="number"
            value={form.keepAlive}
            onChange={e => setForm({ ...form, keepAlive: parseInt(e.target.value) || 60 })}
            className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
            disabled={connected}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Пользователь</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={form.username || ''}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="Необязательно"
              disabled={connected}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Пароль</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={form.password || ''}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
              placeholder="Необязательно"
              disabled={connected}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.useSSL}
            onChange={e => setForm({ ...form, useSSL: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/25"
            disabled={connected}
          />
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">Использовать SSL (WSS)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.cleanSession}
            onChange={e => setForm({ ...form, cleanSession: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/25"
            disabled={connected}
          />
          <span className="text-sm text-gray-300">Clean Session</span>
        </label>
      </div>

      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`w-full md:w-auto px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
          connected
            ? 'bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/20'
            : connecting
            ? 'bg-yellow-500/50 cursor-wait'
            : 'bg-blue-500/80 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
        }`}
      >
        {connected ? 'Отключиться' : connecting ? 'Подключение...' : 'Подключиться'}
      </button>
    </div>
  );
}
