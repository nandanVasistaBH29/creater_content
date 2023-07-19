const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*", //dont do this
  },
});
io.on("connection", (socker) => {
  socker.on("send-changes", (delta) => {
    console.log(delta);
    socker.broadcast.emit("recieve-changes", delta);
  });
});

server.listen(3001, () => {
  console.log("websocket server listening on PORT " + 3001);
});
