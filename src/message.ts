export enum MessageType {
  WELCOME = "WELCOME",
  SYNC = "SYNC",
}

export interface Message<T> {
  type: MessageType;
  payload: T;
}

export interface WelcomePayload {
  id: string;
  worldState: unknown;
}

export interface SyncPayload {
  worldState: unknown;
}
