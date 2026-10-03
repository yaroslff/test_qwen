import { useMqtt } from '../context/MqttContext';
import { Activity, MessageSquare, Radio, Users, HardDrive, ArrowDown, ArrowUp, Hash } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const { connected, stats, messages, subscriptions } = useMqtt();
  const [chartData, setChartData] = useState<{ time: string; received: number; sent: number }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        const newPoint = {
          time: timeStr,
          received: stats.messagesReceived,
          sent: stats.messagesSent,
        };
        const updated = [...prev, newPoint].slice(-20);
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.messagesReceived, stats.messagesSent]);

  const statCards = [
    {
      title: 'Сообщений получено',
      value: stats.messagesReceived,
      icon: ArrowDown,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      title: 'Сообщений отправлено',
      value: stats.messagesSent,
      icon: ArrowUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      title: 'Подписки',
      value: subscriptions.length,
      icon: Radio,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      title: 'Уники topics',
      value: stats.topicsCount,
      icon: Hash,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
    },
    {
      title: 'Данные получено',
      value: formatBytes(stats.bytesReceived),
      icon: HardDrive,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      title: 'Данные отправлено',
      value: formatBytes(stats.bytesSent),
      icon: HardDrive,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} border ${card.border} rounded-xl p-5 backdrop-blur-sm transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">{card.title}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Активность сообщений
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Area type="monotone" dataKey="received" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Получено" />
              <Area type="monotone" dataKey="sent" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Отправлено" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            Последние сообщения
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Нет сообщений</p>
            ) : (
              messages.slice(0, 10).map(msg => (
                <div key={msg.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-blue-400 truncate">{msg.topic}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{msg.payload}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-purple-400" />
            Активные подписки
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {subscriptions.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Нет активных подписок</p>
            ) : (
              subscriptions.map(sub => (
                <div key={sub.topic} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono text-purple-400">{sub.topic}</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">QoS {sub.qos}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Сообщений: {sub.messageCount}</span>
                    <span className={`w-2 h-2 rounded-full ${sub.active ? 'bg-green-400' : 'bg-red-400'}`} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
