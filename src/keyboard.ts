export class Keyboard {
  private pressedKeys = new Set<string>();

  constructor() {
    document.addEventListener("keydown", (e) => this.pressedKeys.add(e.key));
    document.addEventListener("keyup", (e) => this.pressedKeys.delete(e.key));
  }

  isPressed(direction: "UP" | "DOWN" | "LEFT" | "RIGHT"): boolean {
    const map = {
      UP: "ArrowUp",
      DOWN: "ArrowDown",
      LEFT: "ArrowLeft",
      RIGHT: "ArrowRight",
    };
    return this.pressedKeys.has(map[direction]);
  }
}
