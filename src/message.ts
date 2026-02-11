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
}

export interface IntentPayload {
  id: string;
  deltaX: number;
  deltaY: number;
}
