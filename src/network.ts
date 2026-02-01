import { MessageType, type Message } from "./message";

export class NetworkManager {
  private socket: WebSocket;
  private inboundBuffer: Message<unknown>[];
  private outboundBuffer: Message<unknown>[];

  constructor(
    wsUrl: string,
    inboundBuffer: Message<unknown>[],
    outboundBuffer: Message<unknown>[],
    pollIntervalMs: number = 100,
  ) {
    this.inboundBuffer = inboundBuffer;
    this.outboundBuffer = outboundBuffer;
    this.socket = new WebSocket(wsUrl);
    this.setupEventHandlers();
    this.startOutboundPolling(pollIntervalMs);
  }

  private setupEventHandlers() {
    this.socket.onopen = () => {
      this.inboundBuffer.push({ type: MessageType.CONNECTED });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as Message<unknown>;
        this.inboundBuffer.push(message);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    this.socket.onclose = () => {
      this.inboundBuffer.push({ type: MessageType.DISCONNECTED });
    };
  }

  private startOutboundPolling(pollIntervalMs: number) {
    setInterval(() => {
      if (this.outboundBuffer.length > 0 && this.socket.readyState === WebSocket.OPEN) {
        while (this.outboundBuffer.length > 0) {
          const message = this.outboundBuffer.shift();
          if (message) {
            this.socket.send(JSON.stringify(message));
          }
        }
      }
    }, pollIntervalMs);
  }
}
