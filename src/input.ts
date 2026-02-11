import type { Keyboard } from "./keyboard";
import type { IntentPayload, Message } from "./message";
import { MessageType } from "./message";

const MOVE_STEP = 4;

export class IntentManager {
  private outboundBuffer: Message<unknown>[];
  private keyboard: Keyboard;
  private clientId: string = "";

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
    const player = this.clientId
    if (!player) {
        console.warn("Client ID not set, cannot generate intent");
        return;
    }
    let deltaX = 0;
    let deltaY = 0;

    if (this.keyboard.isPressed("RIGHT")) {
      deltaX += MOVE_STEP;
    }
    if (this.keyboard.isPressed("LEFT")) {
      deltaX -= MOVE_STEP;
    }
    if (this.keyboard.isPressed("UP")) {
      deltaY -= MOVE_STEP;
    }
    if (this.keyboard.isPressed("DOWN")) {
      deltaY += MOVE_STEP;
    }

    if (deltaX !== 0 || deltaY !== 0) {
      const intentMessage: Message<IntentPayload> = {
        type: MessageType.INTENT,
        payload: {
          id: this.clientId,
          deltaX: deltaX,
          deltaY: deltaY,
        },
      };
      this.outboundBuffer.push(intentMessage);
    }
  }
}
