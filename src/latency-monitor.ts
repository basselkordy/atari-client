export interface LatencySnapshot {
  pingRttMs: number | null;
  pingRttAvgMs: number | null;
  intentRttMs: number | null;
  physicsDurationMs: number | null;
  physicsMaxMs: number | null;
  broadcastDurationMs: number | null;
  syncBytesPerFrame: number | null;
  syncBytesPerSecond: number | null;
  visible: boolean;
}

export class LatencyMonitor {
  private pingHistory: number[] = [];
  private readonly pingHistorySize = 5;

  private _pingRttMs: number | null = null;
  private _intentRttMs: number | null = null;
  private _physicsDurationMs: number | null = null;
  private _physicsMaxMs: number | null = null;
  private _broadcastDurationMs: number | null = null;
  private _syncBytesPerFrame: number | null = null;

  private byteAccumulator = 0;
  private byteWindowStart = Date.now();

  private _visible = false;

  // Called by NetworkManager when a PONG is received
  recordPing(rttMs: number): void {
    this.pingHistory.push(rttMs);
    if (this.pingHistory.length > this.pingHistorySize) {
      this.pingHistory.shift();
    }
    this._pingRttMs = rttMs;
  }

  // Called by StateManager when a SYNC is processed
  recordSync(
    rawByteLength: number,
    lastIntentSentAt: number | null,
    physicsDurationMs: number,
    broadcastDurationMs: number,
  ): void {
    // Intent RTT: client stamped sentAt when it sent the INTENT.
    // Server echoed it back unchanged. So Date.now() - sentAt = full round-trip
    // using only the client clock — no clock skew involved.
    if (lastIntentSentAt !== null) {
      this._intentRttMs = Date.now() - lastIntentSentAt;
    }

    // These come from the server's own clock — valid relative to each other,
    // but not comparable to client-side timestamps.
    this._physicsDurationMs = physicsDurationMs;
    if (this._physicsMaxMs === null || physicsDurationMs > this._physicsMaxMs) {
      this._physicsMaxMs = physicsDurationMs;
    }
    this._broadcastDurationMs = broadcastDurationMs;

    this._syncBytesPerFrame = rawByteLength;
    this.byteAccumulator += rawByteLength;
  }

  toggleVisible(): void {
    this._visible = !this._visible;
  }

  getSnapshot(): LatencySnapshot {
    const now = Date.now();
    const windowElapsed = (now - this.byteWindowStart) / 1000; // seconds

    const bps =
      windowElapsed >= 1.0 ? this.byteAccumulator / windowElapsed : null;

    // Reset accumulator every ~5 seconds to stay current
    if (windowElapsed >= 5) {
      this.byteAccumulator = 0;
      this.byteWindowStart = now;
    }

    const avg =
      this.pingHistory.length > 0
        ? Math.round(
            this.pingHistory.reduce((a, b) => a + b, 0) /
              this.pingHistory.length,
          )
        : null;

    return {
      pingRttMs: this._pingRttMs,
      pingRttAvgMs: avg,
      intentRttMs: this._intentRttMs,
      physicsDurationMs: this._physicsDurationMs,
      physicsMaxMs: this._physicsMaxMs,
      broadcastDurationMs: this._broadcastDurationMs,
      syncBytesPerFrame: this._syncBytesPerFrame,
      syncBytesPerSecond: bps !== null ? Math.round(bps) : null,
      visible: this._visible,
    };
  }
}
