import { useState } from 'react';
import { useMqtt } from '../context/MqttContext';
import { Send, History, Clock, Trash2 } from 'lucide-react';

interface PublishHistoryItem {
  topic: string;
  payload: string;
  qos: 0 | 1 | 2;
  retain: boolean;
  timestamp: Date;
}

export default function Publish() {
  const { connected, publish } = useMqtt();
  const [topic, setTopic] = useState('');
  const [payload, setPayload] = useState('');
  const [qos, setQos] = useState<0 | 1 | 2>(0);
  const [retain, setRetain] = useState(false);
  const [history, setHistory] = useState<PublishHistoryItem[]>([]);
  const [success, setSuccess] = useState(false);

  const handlePublish = () => {
    if (!topic.trim() || !connected) return;
    publish(topic.trim(), payload, qos, retain);
    
    setHistory(prev => [{
      topic: topic.trim(),
      payload,
      qos,
      retain,
      timestamp: new Date(),
    }, ...prev].slice(0, 20));

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const loadFromHistory = (item: PublishHistoryItem) => {
    setTopic(item.topic);
    setPayload(item.payload);
    setQos(item.qos);
    setRetain(item.retain);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-blue-400" />
          Публикация сообщения
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Топик</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="home/living-room/temperature"
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all font-mono text-sm"
              disabled={!connected}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Payload</label>
            <textarea
              value={payload}
              onChange={e => setPayload(e.target.value)}
              placeholder='{"temperature": 22.5, "humidity": 60}'
              rows={6}
              className="w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all font-mono text-sm resize-none"
              disabled={!connected}
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">QoS</label>
              <select
                value={qos}
                onChange={e => setQos(parseInt(e.target.value) as 0 | 1 | 2)}
                className="px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all"
                disabled={!connected}
              >
                <option value={0}>QoS 0 (At most once)</option>
                <option value={1}>QoS 1 (At least once)</option>
                <option value={2}>QoS 2 (Exactly once)</option>
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retain}
                  onChange={e => setRetain(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/25"
                  disabled={!connected}
                />
                <span className="text-sm text-gray-300">Retain</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePublish}
              disabled={!connected || !topic.trim()}
              className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center gap-2 ${
                success
                  ? 'bg-green-500/80 shadow-lg shadow-green-500/20'
                  : 'bg-blue-500/80 hover:bg-blue-500 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              {success ? 'Отправлено!' : 'Опубликовать'}
            </button>

            {!connected && (
              <span className="text-sm text-yellow-400">⚠️ Не подключено к брокеру</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick templates */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Быстрые шаблоны</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Температура', topic: 'sensor/temperature', payload: '{"value": 22.5, "unit": "°C"}' },
            { label: 'Влажность', topic: 'sensor/humidity', payload: '{"value": 60, "unit": "%"}' },
            { label: 'Статус устройства', topic: 'device/status', payload: '{"online": true, "battery": 85}' },
            { label: 'Команда вкл', topic: 'device/command', payload: '{"action": "turn_on", "device": "light_1"}' },
            { label: 'Команда выкл', topic: 'device/command', payload: '{"action": "turn_off", "device": "light_1"}' },
            { label: 'GPS координаты', topic: 'tracker/location', payload: '{"lat": 55.7558, "lng": 37.6173}' },
          ].map((template, i) => (
            <button
              key={i}
              onClick={() => { setTopic(template.topic); setPayload(template.payload); }}
              className="p-3 bg-gray-800/30 border border-gray-700/30 rounded-lg text-left hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{template.label}</p>
              <p className="text-xs font-mono text-gray-500 mt-1 truncate">{template.topic}</p>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              История публикаций
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Очистить
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => loadFromHistory(item)}
                className="w-full p-3 bg-gray-800/30 border border-gray-700/20 rounded-lg text-left hover:border-orange-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-orange-300 truncate">{item.topic}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">QoS {item.qos}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate font-mono">{item.payload}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
