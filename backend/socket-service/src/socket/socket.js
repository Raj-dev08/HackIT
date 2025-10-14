import { Server } from 'socket.io'
import http from 'http'
import express from 'express'


const app = express();

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin:"*"
    }
})

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; 

io.on("connection", (socket) => {
    // console.log("New client connected :",socket.id)

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    socket.on("disconnect", () => {
        // console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
    });
})

export {io,server}