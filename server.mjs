import { WebSocketServer } from "ws";
import { nanoid } from "nanoid";

const PORT = process.env.PORT || 8787;
const wss = new WebSocketServer({ port: PORT, path: "/ws" });

const queue = [];

function say(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}

function pair(a, b) {
  const aid = nanoid(6), bid = nanoid(6);
  a.partner = b; b.partner = a;
  say(a, { type: "paired", peerId: bid });
  say(b, { type: "paired", peerId: aid });
}

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    let data = {};
    try { data = JSON.parse(msg.toString()); } catch {}
    if (data.type === "find") {
      if (queue.length) pair(ws, queue.shift());
      else queue.push(ws);
    }
    if (data.type === "msg" && ws.partner) say(ws.partner, { type: "msg", text: data.text });
    if (data.type === "typing" && ws.partner) say(ws.partner, { type: "typing", on: !!data.on });
  });
  ws.on("close", () => {
    const idx = queue.indexOf(ws);
    if (idx >= 0) queue.splice(idx, 1);
    if (ws.partner) say(ws.partner, { type: "left" });
  });
});

console.log(`MyVent Server läuft auf Port ${PORT}`);
