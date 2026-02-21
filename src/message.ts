export enum MessageType {
  CONNECTED = "CONNECTED",
  WELCOME = "WELCOME",
  SYNC = "SYNC",
  DISCONNECTED = "DISCONNECTED",
  INTENT = "INTENT",
  PING = "PING",
  PONG = "PONG",
}

export interface Message<T = void> {
  type: MessageType;
  payload?: T;
}

export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
}

export interface Wall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameMap {
  walls: Wall[];
  platforms: Platform[];
}

export interface WelcomePayload {
  id: string;
  worldState: Player[];
  map: GameMap;
}

export interface SyncPayload {
  worldState: Player[];
  map: GameMap;
  lastIntentSeq: number | null;
  lastIntentSentAt: number | null;
  physicsDurationMs: number;
  broadcastDurationMs: number;
}

export interface IntentPayload {
  id: string;
  left: boolean;
  right: boolean;
  down: boolean;
  jump: boolean;
  seq: number;
  sentAt: number;
}

export interface PingPayload {
  clientTime: number;
}

export interface PongPayload {
  clientTime: number;
  serverTime: number;
}
