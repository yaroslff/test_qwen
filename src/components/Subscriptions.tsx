import { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { Radio, Plus, Trash2, MessageSquare, Filter, X } from 'lucide-react';

export default function Subscriptions() {
  const { connected, subscriptions, messages, subscribe, unsubscribe, clearMessages } = useMqtt();
  const [newTopic, setNewTopic] = useState('');
  const [newQos, setNewQos] = useState<0 | 1 | 2>(0);
  const [filterTopic, setFilterTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const handleSubscribe = () => {
    if (!newTopic.trim() || !connected) return;
    subscribe(newTopic.trim(), newQos);
    setNewTopic('');
  };

  const filteredMessages = selectedTopic
    ? messages.filter(m => m.topic === selectedTopic || matchTopic(m.topic, selectedTopic))
    : filterTopic
    ? messages.filter(m => m.topic.includes(filterTopic))
    : messages;

  function matchTopic(msgTopic: string, subTopic: string): boolean {
    if (subTopic === '#') return true;
    const subParts = subTopic.split('/');
    const msgParts = msgTopic.split('/');
    for (let i = 0; i < subParts.length; i++) {
      if (subParts[i] === '#') return true;
      if (subParts[i] === '+') continue;
      if (subParts[i] !== msgParts[i]) return false;
    }
    return subParts.length === msgParts.length;
  }

  return (
    <div className="space-y-6">
      {/* Subscribe form */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Radio className="w-5 h-5 text-purple-400" />
          Подписка на топик
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
            placeholder="sensor/temperature/#"
            className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all font-mono text-sm"
            disabled={!connected}
          />
          <select
            value={newQos}
            onChange={e => setNewQos(parseInt(e.target.value) as 0 | 1 | 2)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-purple-500/50 transition-all"
            disabled={!connected}
          >
            <option value={0}>QoS 0</option>
            <option value={1}>QoS 1</option>
            <option value={2}>QoS 2</option>
          </select>
          <button
            onClick={handleSubscribe}
            disabled={!connected || !newTopic.trim()}
            className="px-6 py-2.5 bg-purple-500/80 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Подписаться
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Используйте # для подписки на все вложенные топики, + для одного уровня. Пример: home/+/temperature
        </p>
      </div>

      {/* Active subscriptions */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Активные подписки ({subscriptions.length})</h3>
        {subscriptions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">Нет активных подписок. Добавьте топик выше.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subscriptions.map(sub => (
              <div
                key={sub.topic}
                className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedTopic === sub.topic
                    ? 'bg-purple-500/10 border-purple-500/50'
                    : 'bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50'
                }`}
                onClick={() => setSelectedTopic(selectedTopic === sub.topic ? null : sub.topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-purple-300 truncate">{sub.topic}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">QoS {sub.qos}</span>
                      <span className="text-xs text-gray-500">{sub.messageCount} msg</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); unsubscribe(sub.topic); }}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {sub.lastMessage && (
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    Последнее: {sub.lastMessage.payload}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-400" />
            Сообщения ({filteredMessages.length})
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filterTopic}
                onChange={e => setFilterTopic(e.target.value)}
                placeholder="Фильтр по топику..."
                className="pl-9 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all w-48"
              />
              {filterTopic && (
                <button onClick={() => setFilterTopic('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-500 hover:text-white" />
                </button>
              )}
            </div>
            <button
              onClick={clearMessages}
              className="px-3 py-2 text-sm bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              Очистить
            </button>
          </div>
        </div>

        {selectedTopic && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-400">Фильтр по подписке:</span>
            <span className="text-sm font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{selectedTopic}</span>
            <button onClick={() => setSelectedTopic(null)} className="text-gray-500 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Нет сообщений</p>
          ) : (
            filteredMessages.map(msg => (
              <div key={msg.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/20 hover:border-gray-600/40 transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-mono text-green-400 truncate max-w-[60%]">{msg.topic}</span>
                  <div className="flex items-center gap-2">
                    {msg.retain && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">RETAIN</span>}
                    <span className="text-xs bg-gray-700/50 text-gray-400 px-1.5 py-0.5 rounded">QoS {msg.qos}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap break-all font-mono bg-gray-900/50 rounded p-2 overflow-x-auto">
                  {formatPayload(msg.payload)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatPayload(payload: string): string {
  try {
    const parsed = JSON.parse(payload);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return payload;
  }
}
