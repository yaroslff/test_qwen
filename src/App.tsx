import { useState } from 'react';
import { MqttProvider, useMqtt } from './context/MqttContext';
import ConnectionPanel from './components/ConnectionPanel';
import Dashboard from './components/Dashboard';
import Subscriptions from './components/Subscriptions';
import Publish from './components/Publish';
import {
  LayoutDashboard,
  Radio,
  Send,
  Wifi,
  WifiOff,
  Menu,
  X,
  Server,
  Zap,
} from 'lucide-react';

type Tab = 'dashboard' | 'subscribe' | 'publish';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { connected } = useMqtt();

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Дашборд', icon: LayoutDashboard },
    { id: 'subscribe' as Tab, label: 'Подписки', icon: Radio },
    { id: 'publish' as Tab, label: 'Публикация', icon: Send },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950/20 via-gray-950 to-purple-950/20 pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MQTT Manager
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Управление брокером</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                connected
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{connected ? 'Подключено' : 'Отключено'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Connection Panel */}
        <div className="mb-6">
          <ConnectionPanel />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1.5 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'subscribe' && <Subscriptions />}
          {activeTab === 'publish' && <Publish />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              <span>MQTT Broker Manager</span>
            </div>
            <span>WebSocket Connection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <MqttProvider>
      <AppContent />
    </MqttProvider>
  );
}
