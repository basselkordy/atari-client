// 1. Setup - Port 3000 matches your BE .env
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

const statusText = document.getElementById("status-text")!;
const chatWindow = document.getElementById("chat-window")!;
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
  const msgDiv = document.createElement("div");
  msgDiv.innerText = event.data; // Server sends: "ip:port says 'message'"
  chatWindow.appendChild(msgDiv);

  // Auto-scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
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
