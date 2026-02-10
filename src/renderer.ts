import { StateManager } from "./state";

export class Renderer {
  private stateManager: StateManager;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private statusText: HTMLElement;
  private clientIdDisplay: HTMLElement;
  private worldStateDisplay: HTMLElement;

  // Canvas dimensions
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;

  // Debug flag - set to true to show canvas bounds
  private readonly DEBUG_SHOW_BOUNDS = true;

  constructor(stateManager: StateManager, frameRate: number) {
    this.stateManager = stateManager;
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
    const SIDE = 50;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    state.worldState.forEach((player) => {
      // Convert from body-center (server) to top-left (canvas)
      const topLeftX = player.x - SIDE / 2;
      const topLeftY = player.y - SIDE / 2;

      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(topLeftX, topLeftY, SIDE, SIDE);

      // Draw player ID below the rectangle (using center position)
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "12px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(player.id, player.x, topLeftY + SIDE + 14);
    });

    // Debug: Draw canvas bounds indicators
    if (this.DEBUG_SHOW_BOUNDS) {
      this.drawBoundsIndicators();
    }
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
}
