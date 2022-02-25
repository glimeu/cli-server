const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const { randomUUID } = require("crypto");

const app = express();
const server = http.createServer(app);
const socket = new WebSocket.WebSocketServer({ server });

const PORT = process.env.PORT || 4000;

app.use(cors());

/** @type {{id: string, content: string, author: string}[]} */
const messages = [];

/**
 * @param {string} content
 * @param {string} author
 */
function onMessage(content, author) {
  const message = {
    id: randomUUID(),
    content,
    author,
  };

  messages.push(message);

  socket.clients.forEach((client) => {
    client.send(JSON.stringify({ type: "message", data: message }));
  });
}

/**
 * @param {WebSocket.WebSocket} ws
 */
function onConnection(ws) {
  ws.on("message", (message) => {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case "message":
          onMessage(data.content, data.author);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error.message);
    }
  });
}

socket.on("connection", onConnection);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
