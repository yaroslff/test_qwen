import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import mqtt, { MqttClient as MqttClientType } from 'mqtt';
import { MqttMessage, MqttSubscription, ConnectionConfig, BrokerStats } from '../types/mqtt';
import { v4 as uuidv4 } from 'uuid';

interface MqttContextType {
  connected: boolean;
  connecting: boolean;
  config: ConnectionConfig;
  messages: MqttMessage[];
  subscriptions: MqttSubscription[];
  stats: BrokerStats;
  connect: (config: ConnectionConfig) => void;
  disconnect: () => void;
  subscribe: (topic: string, qos: 0 | 1 | 2) => void;
  unsubscribe: (topic: string) => void;
  publish: (topic: string, payload: string, qos: 0 | 1 | 2, retain: boolean) => void;
  clearMessages: () => void;
}

const MqttContext = createContext<MqttContextType | null>(null);

const defaultConfig: ConnectionConfig = {
  host: 'broker.emqx.io',
  port: 8083,
  clientId: `mqtt_manager_${Math.random().toString(16).substring(2, 8)}`,
  useSSL: false,
  cleanSession: true,
  keepAlive: 60,
};

const defaultStats: BrokerStats = {
  messagesReceived: 0,
  messagesSent: 0,
  bytesReceived: 0,
  bytesSent: 0,
  subscriptionsCount: 0,
  connectedClients: 0,
  topicsCount: 0,
};

export function MqttProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>(defaultConfig);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [subscriptions, setSubscriptions] = useState<MqttSubscription[]>([]);
  const [stats, setStats] = useState<BrokerStats>(defaultStats);
  const clientRef = useRef<MqttClientType | null>(null);
  const topicsRef = useRef<Set<string>>(new Set());

  const connect = useCallback((newConfig: ConnectionConfig) => {
    setConnecting(true);
    setConfig(newConfig);

    const protocol = newConfig.useSSL ? 'wss' : 'ws';
    const url = `${protocol}://${newConfig.host}:${newConfig.port}/mqtt`;

    const client = mqtt.connect(url, {
      clientId: newConfig.clientId,
      username: newConfig.username,
      password: newConfig.password,
      clean: newConfig.cleanSession,
      keepalive: newConfig.keepAlive,
      reconnectPeriod: 5000,
      connectTimeout: 10000,
    });

    client.on('connect', () => {
      setConnected(true);
      setConnecting(false);
      clientRef.current = client;
    });

    client.on('message', (topic: string, payload: Buffer, packet) => {
      const message: MqttMessage = {
        id: uuidv4(),
        topic,
        payload: payload.toString(),
        qos: packet.qos,
        retain: packet.retain || false,
        timestamp: new Date(),
      };

      setMessages(prev => [message, ...prev].slice(0, 500));
      setSubscriptions(prev => prev.map(sub =>
        sub.topic === topic
          ? { ...sub, messageCount: sub.messageCount + 1, lastMessage: message }
          : sub
      ));
      setStats(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
        bytesReceived: prev.bytesReceived + payload.length,
        topicsCount: topicsRef.current.size,
      }));
    });

    client.on('close', () => {
      setConnected(false);
      setConnecting(false);
    });

    client.on('error', () => {
      setConnecting(false);
    });

    client.on('offline', () => {
      setConnected(false);
    });

    client.on('reconnect', () => {
      setConnecting(true);
    });
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
    setSubscriptions([]);
    topicsRef.current.clear();
  }, []);

  const subscribe = useCallback((topic: string, qos: 0 | 1 | 2) => {
    if (!clientRef.current) return;

    clientRef.current.subscribe(topic, { qos }, (err) => {
      if (!err) {
        setSubscriptions(prev => {
          const exists = prev.find(s => s.topic === topic);
          if (exists) {
            return prev.map(s => s.topic === topic ? { ...s, qos, active: true } : s);
          }
          return [...prev, { topic, qos, active: true, messageCount: 0 }];
        });
        topicsRef.current.add(topic);
        setStats(prev => ({
          ...prev,
          subscriptionsCount: prev.subscriptionsCount + 1,
          topicsCount: topicsRef.current.size,
        }));
      }
    });
  }, []);

  const unsubscribe = useCallback((topic: string) => {
    if (!clientRef.current) return;

    clientRef.current.unsubscribe(topic, () => {
      setSubscriptions(prev => prev.filter(s => s.topic !== topic));
      topicsRef.current.delete(topic);
      setStats(prev => ({
        ...prev,
        subscriptionsCount: Math.max(0, prev.subscriptionsCount - 1),
        topicsCount: topicsRef.current.size,
      }));
    });
  }, []);

  const publish = useCallback((topic: string, payload: string, qos: 0 | 1 | 2, retain: boolean) => {
    if (!clientRef.current) return;

    clientRef.current.publish(topic, payload, { qos, retain }, () => {
      const message: MqttMessage = {
        id: uuidv4(),
        topic,
        payload,
        qos,
        retain,
        timestamp: new Date(),
      };
      setMessages(prev => [message, ...prev].slice(0, 500));
      setStats(prev => ({
        ...prev,
        messagesSent: prev.messagesSent + 1,
        bytesSent: prev.bytesSent + payload.length,
      }));
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    return () => {
      if (clientRef.current) {
        clientRef.current.end(true);
      }
    };
  }, []);

  return (
    <MqttContext.Provider value={{
      connected,
      connecting,
      config,
      messages,
      subscriptions,
      stats,
      connect,
      disconnect,
      subscribe,
      unsubscribe,
      publish,
      clearMessages,
    }}>
      {children}
    </MqttContext.Provider>
  );
}

export function useMqtt() {
  const context = useContext(MqttContext);
  if (!context) throw new Error('useMqtt must be used within MqttProvider');
  return context;
}
