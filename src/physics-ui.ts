import { PhysicsManager, type WorldPhysics, type PlayerPhysics } from "./physics";

interface WorldSliderControl {
  id: string;
  key: keyof WorldPhysics;
  input: HTMLInputElement;
  valueDisplay: HTMLElement;
}

interface PlayerSliderControl {
  id: string;
  key: keyof PlayerPhysics;
  input: HTMLInputElement;
  valueDisplay: HTMLElement;
}

export class PhysicsUI {
  private physicsManager: PhysicsManager;
  private getClientId: () => string;
  private worldSliders: WorldSliderControl[] = [];
  private playerSliders: PlayerSliderControl[] = [];

  constructor(physicsManager: PhysicsManager, getClientId: () => string) {
    this.physicsManager = physicsManager;
    this.getClientId = getClientId;
    this.initializeSliders();
  }

  private initializeSliders() {
    const worldConfigs: Array<{ id: string; key: keyof WorldPhysics; label: string; min: number; max: number; step: number; defaultValue: number }> = [
      { id: "gravity",               key: "gravity",               label: "Gravity",             min: 0, max: 5,    step: 0.1,  defaultValue: 1   },
      { id: "dropThroughDurationMs", key: "dropThroughDurationMs", label: "Drop Through (ms)",   min: 0, max: 1000, step: 50,   defaultValue: 300 },
    ];

    const playerConfigs: Array<{ id: string; key: keyof PlayerPhysics; label: string; min: number; max: number; step: number; defaultValue: number }> = [
      { id: "moveSpeed",   key: "moveSpeed",   label: "Move Speed",   min: 0,   max: 20,  step: 0.5,  defaultValue: 5    },
      { id: "jumpForce",   key: "jumpForce",   label: "Jump Force",   min: -20, max: 0,   step: 0.5,  defaultValue: -8   },
      { id: "friction",    key: "friction",    label: "Friction",     min: 0,   max: 1,   step: 0.01, defaultValue: 0.01 },
      { id: "frictionAir", key: "frictionAir", label: "Friction Air", min: 0,   max: 0.1, step: 0.01, defaultValue: 0    },
      { id: "restitution", key: "restitution", label: "Restitution",  min: 0,   max: 1,   step: 0.1,  defaultValue: 0    },
    ];

    const container = document.getElementById("world-physics")!;

    worldConfigs.forEach(({ id, key, label, min, max, step, defaultValue }) => {
      const { input, valueDisplay } = this.buildControl(container, { id, label, min, max, step, defaultValue });
      this.worldSliders.push({ id, key, input, valueDisplay });
      input.addEventListener("input",  () => { valueDisplay.textContent = input.value; });
      input.addEventListener("change", () => { this.sendWorldUpdate(key, parseFloat(input.value)); });
    });

    playerConfigs.forEach(({ id, key, label, min, max, step, defaultValue }) => {
      const { input, valueDisplay } = this.buildControl(container, { id, label, min, max, step, defaultValue });
      this.playerSliders.push({ id, key, input, valueDisplay });
      input.addEventListener("input",  () => { valueDisplay.textContent = input.value; });
      input.addEventListener("change", () => { this.sendPlayerUpdate(key, parseFloat(input.value)); });
    });
  }

  private buildControl(container: HTMLElement, opts: { id: string; label: string; min: number; max: number; step: number; defaultValue: number }) {
    const wrap = document.createElement("div");
    wrap.className = "physics-control";
    wrap.innerHTML = `
      <label>${opts.label}: <span id="${opts.id}-value">${opts.defaultValue}</span></label>
      <input type="range" id="${opts.id}-slider" min="${opts.min}" max="${opts.max}" step="${opts.step}" value="${opts.defaultValue}" />
    `;
    container.appendChild(wrap);
    return {
      input:        wrap.querySelector("input") as HTMLInputElement,
      valueDisplay: wrap.querySelector("span")  as HTMLElement,
    };
  }

  private async sendWorldUpdate(key: keyof WorldPhysics, value: number) {
    try {
      const physics: WorldPhysics = { [key]: value };
      await this.physicsManager.updateWorldPhysics(physics);
      console.log(`Updated world ${key} to ${value}`);
    } catch (error) {
      console.error(`Failed to update world ${key}:`, error);
    }
  }

  private async sendPlayerUpdate(key: keyof PlayerPhysics, value: number) {
    try {
      const playerId = this.getClientId();
      if (!playerId) {
        console.warn(`Cannot update player ${key}: no client ID yet`);
        return;
      }
      const physics: PlayerPhysics = { [key]: value };
      await this.physicsManager.updatePlayerPhysics(playerId, physics);
      console.log(`Updated player ${key} to ${value}`);
    } catch (error) {
      console.error(`Failed to update player ${key}:`, error);
    }
  }
}
