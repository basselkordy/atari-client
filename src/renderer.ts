import { RenderHelpers } from "./render-helpers";
import { StateManager } from "./state";
import type { LatencyMonitor } from "./latency-monitor";

export class Renderer {
  private stateManager: StateManager;
  private latencyMonitor: LatencyMonitor;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private statusText: HTMLElement;
  private clientIdDisplay: HTMLElement;
  private worldStateDisplay: HTMLElement;

  // Canvas dimensions - maybe get those from server in the future?
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;

  // Debug flag - set to true to show canvas bounds
  private readonly DEBUG_SHOW_BOUNDS = true;

  constructor(
    stateManager: StateManager,
    latencyMonitor: LatencyMonitor,
    frameRate: number,
  ) {
    this.stateManager = stateManager;
    this.latencyMonitor = latencyMonitor;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.statusText = document.getElementById("status-text")!;
    this.clientIdDisplay = document.getElementById("client-id-display")!;
    this.worldStateDisplay = document.getElementById("world-state-display")!;

    // Set canvas dimensions
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;

    this.startRendering(frameRate);
  }

  private startRendering(frameRate: number) {
    setInterval(() => {
      this.renderGame();
      this.renderUI();
    }, frameRate); // ~60fps
  }

  private renderGame() {
    const state = this.stateManager.getGameState();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.renderStaticBodies(state);
    this.renderPlayers(state);

    // Debug: Draw canvas bounds indicators
    if (this.DEBUG_SHOW_BOUNDS) {
      this.drawBoundsIndicators();
    }

    this.renderDiagnosticsHUD();
  }

  private renderPlayers(state: ReturnType<StateManager["getGameState"]>) {
    const SIDE = 50;

    state.worldState.forEach((player) => {
      const { x: topLeftX, y: topLeftY } = RenderHelpers.centerToTopLeft(
        player.x,
        player.y,
        SIDE,
        SIDE,
      );

      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(topLeftX, topLeftY, SIDE, SIDE);

      // Draw player ID below the rectangle (using center position)
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(player.id, player.x, topLeftY + SIDE + 14);
    });
  }

  private renderStaticBodies(state: ReturnType<StateManager["getGameState"]>) {
    if (!state.map) {
      return;
    }

    const labelYOffset = 4;
    const drawBody = (
      id: string,
      centerX: number,
      centerY: number,
      width: number,
      height: number,
      fill: string,
      textColor: string,
    ) => {
      const { x: topLeftX, y: topLeftY } = RenderHelpers.centerToTopLeft(
        centerX,
        centerY,
        width,
        height,
      );

      this.ctx.fillStyle = fill;
      this.ctx.fillRect(topLeftX, topLeftY, width, height);

      this.ctx.fillStyle = textColor;
      this.ctx.font = "12px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(id, centerX, centerY + labelYOffset);
    };

    state.map.walls.forEach((wall) => {
      drawBody(
        wall.id,
        wall.x,
        wall.y,
        wall.width,
        wall.height,
        "#444444",
        "#ffffff",
      );
    });

    state.map.platforms.forEach((platform) => {
      drawBody(
        platform.id,
        platform.x,
        platform.y,
        platform.width,
        platform.height,
        "#6c7bff",
        "#ffffff",
      );
    });
  }

  private drawBoundsIndicators() {
    const lineLength = 20;
    const lineWidth = 2;

    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = lineWidth;

    // Top-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(lineLength, 0);
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, lineLength);
    this.ctx.stroke();

    // Top-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width, 0);
    this.ctx.lineTo(this.canvas.width - lineLength, 0);
    this.ctx.moveTo(this.canvas.width, 0);
    this.ctx.lineTo(this.canvas.width, lineLength);
    this.ctx.stroke();

    // Bottom-left corner
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(lineLength, this.canvas.height);
    this.ctx.moveTo(0, this.canvas.height);
    this.ctx.lineTo(0, this.canvas.height - lineLength);
    this.ctx.stroke();

    // Bottom-right corner
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(this.canvas.width - lineLength, this.canvas.height);
    this.ctx.moveTo(this.canvas.width, this.canvas.height);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - lineLength);
    this.ctx.stroke();
  }

  private renderUI() {
    const state = this.stateManager.getGameState();

    // Update connection status
    if (state.isConnected) {
      this.statusText.innerText = "Connected 🟢";
      this.statusText.style.color = "green";
    } else {
      this.statusText.innerText = "Disconnected 🔴";
      this.statusText.style.color = "red";
    }

    // Update client ID

    // Update world state JSON display
    this.worldStateDisplay.innerText = JSON.stringify(
      state.worldState,
      null,
      2,
    );
    this.clientIdDisplay.innerText = state.clientId || "N/A";
  }

  private renderDiagnosticsHUD(): void {
    const d = this.latencyMonitor.getSnapshot();
    if (!d.visible) return;

    const fmt = (v: number | null, suffix = "ms") =>
      v !== null ? `${v}${suffix}` : "--";

    const lines: Array<{ text: string; accent?: boolean }> = [
      { text: "Network Diagnostics  [Tab to hide]", accent: true },
      {
        text: `Ping RTT:    ${fmt(d.pingRttMs)}${d.pingRttAvgMs !== null ? `  (avg ${d.pingRttAvgMs}ms)` : ""}`,
      },
      { text: `Intent RTT:  ${fmt(d.intentRttMs)}` },
      {
        text: `Physics:     ${d.physicsDurationMs !== null ? d.physicsDurationMs.toFixed(2) + "ms" : "--"}${d.physicsMaxMs !== null ? `  (max ${d.physicsMaxMs.toFixed(2)}ms)` : ""}`,
      },
      {
        text: `Broadcast:   ${d.broadcastDurationMs !== null ? d.broadcastDurationMs.toFixed(2) + "ms" : "--"}`,
      },
      {
        text: `SYNC size:   ${fmt(d.syncBytesPerFrame, " B/frame")}${d.syncBytesPerSecond !== null ? `  (~${d.syncBytesPerSecond} B/s)` : ""}`,
      },
      { text: "(server clock not synced to client)" },
    ];

    const padding = 10;
    const lineHeight = 18;
    const fontPx = 13;
    const panelWidth = 330;
    const panelHeight = lines.length * lineHeight + padding * 2;
    const panelX = this.CANVAS_WIDTH - panelWidth - 10;
    const panelY = 10;

    // Background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Border
    this.ctx.strokeStyle = "rgba(0, 255, 180, 0.5)";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    this.ctx.font = `${fontPx}px monospace`;
    this.ctx.textAlign = "left";

    lines.forEach((line, i) => {
      const y = panelY + padding + (i + 1) * lineHeight - 4;
      this.ctx.fillStyle = line.accent ? "#00ffb4" : "#e0e0e0";
      this.ctx.fillText(line.text, panelX + padding, y);
    });
  }
}
