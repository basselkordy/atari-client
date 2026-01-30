import { dispatchMessage, getGameState } from "./protocol";
import type { Message } from "./message";

// 1. Setup - Port 3000 matches your BE .env
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

const statusText = document.getElementById("status-text")!;
const clientIdDisplay = document.getElementById("client-id-display")!;
const worldStateDisplay = document.getElementById("world-state-display")!;
const messageInput = document.getElementById(
  "message-input",
) as HTMLInputElement;
const sendBtn = document.getElementById("send-btn")!;

// 2. Initialize Connection
const socket = new WebSocket(WS_URL);

// Update UI on connect
socket.onopen = () => {
  statusText.innerText = "Connected 🟢";
  statusText.style.color = "green";
  console.log("Connected to Backend");
};

// 3. Handle Incoming Messages (The data your server broadcasts)
socket.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data) as Message<unknown>;
    dispatchMessage(message);

    // Update UI with current game state
    const state = getGameState();
    clientIdDisplay.innerText = state.clientId || "N/A";
    worldStateDisplay.innerText = JSON.stringify(state.worldState, null, 2);
  } catch (error) {
    console.error("Failed to parse message:", error);
  }
};

// 4. Send Message to Server
const sendMessage = () => {
  const val = messageInput.value.trim();
  if (val && socket.readyState === WebSocket.OPEN) {
    socket.send(val);
    messageInput.value = "";
  }
};

sendBtn.addEventListener("click", sendMessage);

// Allow pressing "Enter" to send
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

socket.onclose = () => {
  statusText.innerText = "Disconnected 🔴";
  statusText.style.color = "red";
};
