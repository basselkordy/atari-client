import type { InputManager } from "./input";
import type {
  Message,
  WelcomePayload,
  SyncPayload,
  Player,
  IntentPayload,
} from "./message";
import { MessageType } from "./message";

const MOVE_STEP = 4;

export interface GameState {
  clientId: string;
  worldState: Player[];
  isConnected: boolean;
}

export class StateManager {
  private inboundBuffer: Message<unknown>[];
  private outboundBuffer: Message<unknown>[];
  private gameState: GameState;
  private inputManager: InputManager;

  constructor(
    inboundBuffer: Message<unknown>[],
    outboundBuffer: Message<unknown>[],
    inputManager: InputManager,
    networkReceiveRate: number,
    inputSamplingRate: number
  ) {
    this.inboundBuffer = inboundBuffer;
    this.outboundBuffer = outboundBuffer;
    this.gameState = {
      clientId: "",
      worldState: [],
      isConnected: false,
    };
    this.inputManager = inputManager;
    this.startInboundPolling(networkReceiveRate);
    this.startOutboundPolling(inputSamplingRate);
  }

  private startInboundPolling(networkReceiveRate: number) {
    setInterval(() => {
      while (this.inboundBuffer.length > 0) {
        const message = this.inboundBuffer.shift()!;
        this.handleMessage(message);
      }
    }, networkReceiveRate);
  }

  private startOutboundPolling(inputSamplingRate: number) {
    setInterval(() => {
      this.processInput();
    }, inputSamplingRate);
  }

  private processInput() {
    const player = this.gameState.worldState.find(
      (p) => p.id === this.gameState.clientId,
    );
    if (!player) return;

    let deltaX = 0;
    let deltaY = 0;

    if (this.inputManager.isPressed("RIGHT")) {
      deltaX += MOVE_STEP;
    }
    if (this.inputManager.isPressed("LEFT")) {
      deltaX -= MOVE_STEP;
    }
    if (this.inputManager.isPressed("UP")) {
      deltaY -= MOVE_STEP;
    }
    if (this.inputManager.isPressed("DOWN")) {
      deltaY += MOVE_STEP;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const intentMessage: Message<IntentPayload> = {
        type: MessageType.INTENT,
        payload: {
          id: this.gameState.clientId,
          deltaX: deltaX,
          deltaY: deltaY,
        },
      };
      this.outboundBuffer.push(intentMessage);
    }
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  private handleWelcome(payload: WelcomePayload): void {
    console.log(payload);
    this.gameState.clientId = payload.id;
    this.gameState.worldState = payload.worldState;
    console.log("WELCOME received:", this.gameState);
  }

  private handleSync(payload: SyncPayload): void {
    this.gameState.worldState = payload.worldState;
    console.log("SYNC received:", this.gameState);
  }

  private handleMessage(message: Message<unknown>): void {
    console.log(message);
    switch (message.type) {
      case MessageType.CONNECTED:
        this.gameState.isConnected = true;
        console.log("Connected to server");
        break;
      case MessageType.DISCONNECTED:
        this.gameState.isConnected = false;
        console.log("Disconnected from server");
        break;
      case MessageType.WELCOME:
        this.handleWelcome(message.payload as WelcomePayload);
        break;
      case MessageType.SYNC:
        this.handleSync(message.payload as SyncPayload);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }
}
