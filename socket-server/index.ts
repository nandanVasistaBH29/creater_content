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
io.on("connection", async (socket) => {
  socket.on("get-document", async (doc_id: string) => {
    // doc_id is uuid
    if (doc_id === "") return;

    const document = await findOrCreateDocument(doc_id);

    const data = "hello world";
    socket.join(doc_id); //need to join this doc / room
    socket.emit("load-document", data); //sending the data from server
    socket.on("send-changes", (delta) => {
      //this below line is sent to all docs we wanna send it to specific docs
      // socket.broadcast.emit("recieve-changes", delta);
      socket.broadcast.to(doc_id).emit("recieve-changes", delta);
    });
  });
});

server.listen(3001, () => {
  console.log("websocket server listening on PORT " + 3001);
});

const findOrCreateDocument = (doc_id: string) => {};
