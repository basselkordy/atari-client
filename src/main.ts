import { NetworkManager } from "./network";
import { Renderer } from "./renderer";
import type { Message } from "./message";
import { StateManager } from "./state";
import { InputManager } from "./input";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

// Ticker rate constants (in milliseconds)
const INPUT_SAMPLING_RATE = 16; // 60 Hz - how often to check keyboard state
const NETWORK_SEND_RATE = 0; // Immediately send messages to server since the server is event driven. won't scale. but provides smooth movment for now
const NETWORK_RECEIVE_RATE = 16; // 60 Hz - how often to process server messages
const RENDER_RATE = 16; // 60 FPS - how often to render visuals

const inboundBuffer: Message<unknown>[] = [];
const outboundBuffer: Message<unknown>[] = [];

const network = new NetworkManager(
  WS_URL,
  inboundBuffer,
  outboundBuffer,
  NETWORK_SEND_RATE,
);
const input = new InputManager();
const stateManager = new StateManager(
  inboundBuffer,
  outboundBuffer,
  input,
  NETWORK_RECEIVE_RATE,
  INPUT_SAMPLING_RATE,
);

const renderer = new Renderer(stateManager, RENDER_RATE);
