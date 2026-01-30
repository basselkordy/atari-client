import type { Message, WelcomePayload, SyncPayload } from "./message";
import { MessageType } from "./message";

export interface GameState {
  clientId: string;
  worldState: unknown;
}

let gameState: GameState = {
  clientId: "",
  worldState: null,
};

export const handleWelcome = (payload: WelcomePayload): void => {
  console.log(payload);
  gameState.clientId = payload.id;
  gameState.worldState = payload.worldState;
  console.log("WELCOME received:", gameState);
};

export const handleSync = (payload: SyncPayload): void => {
  gameState.worldState = payload.worldState;
  console.log("SYNC received:", gameState);
};

export const getGameState = (): GameState => gameState;

export const dispatchMessage = (message: Message<unknown>): void => {
  console.log(message);
  switch (message.type) {
    case MessageType.WELCOME:
      handleWelcome(message.payload as WelcomePayload);
      break;
    case MessageType.SYNC:
      handleSync(message.payload as SyncPayload);
      break;
    default:
      console.warn("Unknown message type:", message.type);
  }
};
