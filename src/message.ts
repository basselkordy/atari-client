export enum MessageType {
  CONNECTED = "CONNECTED",
  WELCOME = "WELCOME",
  SYNC = "SYNC",
  DISCONNECTED = "DISCONNECTED",
  INTENT = "INTENT",
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

export interface WelcomePayload {
  id: string;
  worldState: Player[];
}

export interface SyncPayload {
  worldState: Player[];
}

export interface IntentPayload {
  id: string;
  deltaX: number;
  deltaY: number;
}
