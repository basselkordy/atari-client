import "./style.css";
import { NetworkManager } from "./network";
import { Renderer } from "./renderer";
import type { Message } from "./message";
import { StateManager } from "./state";
import { Keyboard } from "./keyboard";
import { IntentManager } from "./input";
import { PhysicsManager } from "./physics";
import { PhysicsUI } from "./physics-ui";

const WS_URL = import.meta.env.VITE_WS_URL;
const API_URL = import.meta.env.VITE_API_URL;

// Ticker rate constants (in milliseconds)
const INPUT_SAMPLING_RATE = 1000 / 60; // how often to check keyboard state
const NETWORK_SEND_RATE = 1000 / 60; // matches server tick rate (60 Hz)
const NETWORK_RECEIVE_RATE = 1000 / 60; // how often to process server messages
const RENDER_RATE = 1000 / 60; // 60 FPS - how often to render visuals

const inboundBuffer: Message<unknown>[] = [];
const outboundBuffer: Message<unknown>[] = [];

new NetworkManager(
  WS_URL,
  inboundBuffer,
  outboundBuffer,
  NETWORK_SEND_RATE,
);
const keyboard = new Keyboard();

const intentManager = new IntentManager(
  outboundBuffer,
  keyboard,
  INPUT_SAMPLING_RATE,
);

const stateManager = new StateManager(inboundBuffer, NETWORK_RECEIVE_RATE);

// Link the welcome callback to pass client ID from state manager to intent manager
// this allows the intent manager to stay decoupled from the state manager's internal workings
stateManager.setOnWelcomeCallback((clientId: string) =>
  intentManager.onWelcome(clientId),
);

new Renderer(stateManager, RENDER_RATE);

// Initialize physics controls
const physicsManager = new PhysicsManager(API_URL);
new PhysicsUI(
  physicsManager,
  () => stateManager.getGameState().clientId,
);
