let socket;
let connected = false;
const WS_URL = "https://68bbedfe5a6abdadb860bf11--storied-praline-8d2db0.netlify.app/"; // Ändern wenn du online hostest

const intro = document.getElementById("intro");
const chat = document.getElementById("chat");
const connectBtn = document.getElementById("connectBtn");
const errorEl = document.getElementById("error");
const statusEl = document.getElementById("status");
const messagesEl = document.getElementById("messages");
const typingEl = document.getElementById("typing");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const disconnectBtn = document.getElementById("disconnectBtn");

connectBtn.onclick = connect;
sendBtn.onclick = send;
newChatBtn.onclick = newChat;
disconnectBtn.onclick = disconnect;
msgInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  } else {
    typing(true);
  }
});

function connect() {
  socket = new WebSocket(WS_URL);
  statusEl.textContent = "Verbinde…";
  intro.classList.add("hidden");
  chat.classList.remove("hidden");

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: "find" }));
    pushSys("Suche Partner…");
  };

  socket.onmessage = ev => {
    const data = JSON.parse(ev.data);
    if (data.type === "paired") {
      connected = true;
      statusEl.textContent = "Verbunden mit einem Fremden.";
      pushSys("Du bist jetzt verbunden 👋");
    } else if (data.type === "msg") {
      pushPeer(data.text);
    } else if (data.type === "typing") {
      typingEl.textContent = data.on ? "Fremder tippt…" : "";
    } else if (data.type === "left") {
      pushSys("Dein Partner hat getrennt.");
      connected = false;
      statusEl.textContent = "Warten auf Partner…";
    }
  };

  socket.onclose = () => {
    connected = false;
    pushSys("Verbindung geschlossen.");
    chat.classList.add("hidden");
    intro.classList.remove("hidden");
  };

  socket.onerror = e => {
    errorEl.textContent = "Fehler: Verbindung fehlgeschlagen.";
  };
}

function send() {
  const text = msgInput.value.trim();
  if (!text || !connected) return;
  socket.send(JSON.stringify({ type: "msg", text }));
  pushMe(text);
  msgInput.value = "";
}

function typing(on) {
  if (!socket || !connected) return;
  socket.send(JSON.stringify({ type: "typing", on }));
}

function newChat() {
  disconnect(true);
  connect();
}

function disconnect(silent = false) {
  if (socket) socket.close();
  connected = false;
  if (!silent) pushSys("Getrennt.");
}

function pushMe(text) {
  addMsg("me", text);
}
function pushPeer(text) {
  addMsg("peer", text);
}
function pushSys(text) {
  addMsg("sys", text);
}
function addMsg(type, text) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
