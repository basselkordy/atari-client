import { NetworkManager } from "./network";
import { Renderer } from "./renderer";
import type { Message } from "./message";
import { StateManager } from "./state";
import { InputManager } from "./input";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

const inboundBuffer: Message<unknown>[] = [];
const outboundBuffer: Message<unknown>[] = [];

const network = new NetworkManager(WS_URL, inboundBuffer, outboundBuffer);
const input = new InputManager()
const stateManager = new StateManager(inboundBuffer, outboundBuffer, input);

const renderer = new Renderer(stateManager);
