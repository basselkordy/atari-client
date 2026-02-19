export interface PlayerPhysics {
  moveSpeed?: number;
  jumpForce?: number;
  friction?: number;
  frictionAir?: number;
  restitution?: number;
}

export interface WorldPhysics {
  moveSpeed?: number;
  jumpForce?: number;
  friction?: number;
  frictionAir?: number;
  restitution?: number;
  gravity?: number;
  dropThroughDurationMs?: number;
}

export interface ApiResponse {
  ok: boolean;
}

export class PhysicsManager {
  private configUrl: string;

  constructor(configUrl: string) {
    this.configUrl = configUrl;
  }

  async updatePlayerPhysics(playerId: string, physics: PlayerPhysics): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.configUrl}/players/${playerId}/physics`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(physics),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Failed to update player physics:", error);
      throw error;
    }
  }

  async updateWorldPhysics(physics: WorldPhysics): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.configUrl}/world/physics`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(physics),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update world physics:", error);
      throw error;
    }
  }
}
