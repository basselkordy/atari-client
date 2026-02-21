import { MessageType, type Message, type PongPayload } from "./message";
import type { LatencyMonitor } from "./latency-monitor";

export class NetworkManager {
  private socket: WebSocket;
  private inboundBuffer: Message<unknown>[];
  private outboundBuffer: Message<unknown>[];
  private latencyMonitor: LatencyMonitor;

  constructor(
    wsUrl: string,
    inboundBuffer: Message<unknown>[],
    outboundBuffer: Message<unknown>[],
    latencyMonitor: LatencyMonitor,
    networkSendrate: number = 16, // 60 FPS (send updates every 16MS)
  ) {
    this.inboundBuffer = inboundBuffer;
    this.outboundBuffer = outboundBuffer;
    this.latencyMonitor = latencyMonitor;
    this.socket = new WebSocket(wsUrl);
    this.setupEventHandlers();
    this.startOutboundPolling(networkSendrate);
    this.startPingInterval();
  }

  private setupEventHandlers() {
    this.socket.onopen = () => {
      this.inboundBuffer.push({ type: MessageType.CONNECTED });
    };

    this.socket.onmessage = (event) => {
      try {
        // Capture byte length before parsing. event.data is a string here,
        // so .length counts UTF-16 code units — close enough for ASCII JSON.
        const rawBytes = (event.data as string).length;
        const message = JSON.parse(event.data) as Message<unknown>;

        // PONG is handled here directly — no need to route through StateManager
        if (message.type === MessageType.PONG) {
          const payload = message.payload as PongPayload;
          const rtt = Date.now() - payload.clientTime;
          this.latencyMonitor.recordPing(rtt);
          return;
        }

        // Attach raw byte count to SYNC so StateManager can pass it to LatencyMonitor
        if (message.type === MessageType.SYNC) {
          (message as any).__rawBytes = rawBytes;
        }

        this.inboundBuffer.push(message);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };

    this.socket.onclose = () => {
      this.inboundBuffer.push({ type: MessageType.DISCONNECTED });
    };
  }

  private startOutboundPolling(networkSendrate: number) {
    setInterval(() => {
      if (this.outboundBuffer.length > 0 && this.socket.readyState === WebSocket.OPEN) {
        while (this.outboundBuffer.length > 0) {
          const message = this.outboundBuffer.shift();
          if (message) {
            this.socket.send(JSON.stringify(message));
          }
        }
      }
    }, networkSendrate);
  }

  private startPingInterval() {
    setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.outboundBuffer.push({
          type: MessageType.PING,
          payload: { clientTime: Date.now() },
        });
      }
    }, 1000);
  }
}
