export interface MqttMessage {
  id: string;
  topic: string;
  payload: string;
  qos: number;
  retain: boolean;
  timestamp: Date;
}

export interface MqttSubscription {
  topic: string;
  qos: 0 | 1 | 2;
  active: boolean;
  messageCount: number;
  lastMessage?: MqttMessage;
}

export interface MqttClient {
  id: string;
  clientId: string;
  connected: boolean;
  cleanSession: boolean;
  keepAlive: number;
  subscriptions: string[];
  connectedAt: Date;
  lastActivity: Date;
}

export interface ConnectionConfig {
  host: string;
  port: number;
  clientId: string;
  username?: string;
  password?: string;
  useSSL: boolean;
  cleanSession: boolean;
  keepAlive: number;
}

export interface BrokerStats {
  messagesReceived: number;
  messagesSent: number;
  bytesReceived: number;
  bytesSent: number;
  subscriptionsCount: number;
  connectedClients: number;
  topicsCount: number;
}
