import { StateManager } from "./state";

export class Renderer {
  private stateManager: StateManager;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private statusText: HTMLElement;
  private clientIdDisplay: HTMLElement;
  private worldStateDisplay: HTMLElement;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.statusText = document.getElementById("status-text")!;
    this.clientIdDisplay = document.getElementById("client-id-display")!;
    this.worldStateDisplay = document.getElementById("world-state-display")!;

    this.startRendering();
  }

  private startRendering() {
    setInterval(() => {
      this.renderGame();
      this.renderUI();
    }, 16); // ~60fps
  }

  private renderGame() {
    const state = this.stateManager.getGameState();
    const SIDE = 50;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    state.worldState.forEach((player) => {
      this.ctx.fillStyle = player.color;
      this.ctx.fillRect(player.x, player.y, SIDE, SIDE);

      // Draw player ID below the rectangle
      this.ctx.fillStyle = "#000000";
      this.ctx.font = "12px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText(player.id, player.x + SIDE / 2, player.y + SIDE + 14);
    });
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
