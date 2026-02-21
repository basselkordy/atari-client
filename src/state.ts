import type {
  Message,
  WelcomePayload,
  SyncPayload,
  Player,
  GameMap,
} from "./message";
import { MessageType } from "./message";
import type { LatencyMonitor } from "./latency-monitor";

export interface GameState {
  clientId: string;
  worldState: Player[];
  map: GameMap | null;
  isConnected: boolean;
}

export class StateManager {
  private inboundBuffer: Message<unknown>[];
  private gameState: GameState;
  private onWelcomeCallback: (clientId: string) => void = function () {};
  private latencyMonitor: LatencyMonitor;

  constructor(
    inboundBuffer: Message<unknown>[],
    networkReceiveRate: number,
    latencyMonitor: LatencyMonitor,
  ) {
    this.inboundBuffer = inboundBuffer;
    this.latencyMonitor = latencyMonitor;
    this.gameState = {
      clientId: "",
      worldState: [],
      map: null,
      isConnected: false,
    };
    this.startInboundPolling(networkReceiveRate);
  }

  private startInboundPolling(networkReceiveRate: number) {
    setInterval(() => {
      while (this.inboundBuffer.length > 0) {
        const message = this.inboundBuffer.shift()!;
        this.handleMessage(message);
      }
    }, networkReceiveRate);
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public setOnWelcomeCallback(callback: (clientId: string) => void) {
    this.onWelcomeCallback = callback;
  }

  private handleWelcome(payload: WelcomePayload): void {
    this.gameState.clientId = payload.id;
    this.gameState.worldState = payload.worldState;
    this.gameState.map = payload.map;
    this.onWelcomeCallback(payload.id);
    console.log("WELCOME received:", this.gameState);
  }

  private handleSync(payload: SyncPayload, rawBytes: number): void {
    this.gameState.worldState = payload.worldState;
    this.gameState.map = payload.map;
    this.latencyMonitor.recordSync(
      rawBytes,
      payload.lastIntentSentAt,
      payload.physicsDurationMs,
      payload.broadcastDurationMs,
    );
  }

  private handleMessage(message: Message<unknown>): void {
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
        this.handleSync(
          message.payload as SyncPayload,
          (message as any).__rawBytes ?? 0,
        );
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  }
}
