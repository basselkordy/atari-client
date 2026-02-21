import type { Keyboard } from "./keyboard";
import type { IntentPayload, Message } from "./message";
import { MessageType } from "./message";

export class IntentManager {
  private outboundBuffer: Message<unknown>[];
  private keyboard: Keyboard;
  private clientId: string = "";
  private lastJumpPressed = false;
  private seq = 0;

  constructor(
    outboundBuffer: Message<unknown>[],
    keyboard: Keyboard,
    inputSamplingRate: number,
  ) {
    this.outboundBuffer = outboundBuffer;
    this.keyboard = keyboard;
    this.startSampling(inputSamplingRate);
  }

  private startSampling(inputSamplingRate: number) {
    setInterval(() => {
      this.processInput();
    }, inputSamplingRate);
  }

  public onWelcome(clientId: string) {
    this.clientId = clientId;
  }

  private processInput() {
    const playerId = this.clientId;
    if (!playerId) {
      console.warn("Client ID not set, cannot generate intent");
      return;
    }

    const left = this.keyboard.isPressed("LEFT");
    const right = this.keyboard.isPressed("RIGHT");
    const down = this.keyboard.isPressed("DOWN");
    const jumpPressed = this.keyboard.isPressed("UP");
    const jump = jumpPressed && !this.lastJumpPressed;

    this.lastJumpPressed = jumpPressed;
    this.seq += 1;

    const intentMessage: Message<IntentPayload> = {
      type: MessageType.INTENT,
      payload: {
        id: playerId,
        left,
        right,
        down,
        jump,
        seq: this.seq,
        sentAt: Date.now(),
      },
    };
    this.outboundBuffer.push(intentMessage);
  }
}
