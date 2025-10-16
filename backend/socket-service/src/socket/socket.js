import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import Message from '../model/message.model.js';


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

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("join-chat", ({ userId, chatUserId }) => {
        const roomName = [userId, chatUserId].sort().join("-");
        socket.join(roomName);
        console.log(`User ${userId} joined room: ${roomName}`);
    });

    socket.on("leave-chat", ({ userId, chatUserId }) => {
        const roomName = [userId, chatUserId].sort().join("-");
        socket.leave(roomName);
        console.log(`User ${userId} left room: ${roomName}`);
    });

    socket.on("message_seen", async({message}) => {
        const senderId = message.senderId
        const receiverId = message.receiverId

        const roomId = [senderId , receiverId].sort().join("-")

        const roomSockets = io.sockets.adapter.rooms.get(roomId)

        const receiverSocketId = getReceiverSocketId(receiverId);

        if (!receiverSocketId || !roomSockets || !roomSockets.has(receiverSocketId) || roomSockets.size === 0){
            console.log("Receiver not in room, skipping seen emit")
            return;
        }

        const updatedMessage = await Message.findByIdAndUpdate(
            message._id,
            { isSeen: true },
            { new: true }
        );

        socket.to(roomId).emit("message_seen_byReceiever", { message: updatedMessage})
    })

    socket.on("typingToUser", ({ from, to })=>{
        const receiverSocketId = getReceiverSocketId(to)
        socket.to(receiverSocketId).emit("userTypingToUser",{from})
    })

    socket.on("stopTypingToUser",({to})=>{ 
        const receiverSocketId = getReceiverSocketId(to);
        socket.to(receiverSocketId).emit("userStoppedTypingToUser")
    })

    socket.on("disconnect", () => {
        // console.log("A user disconnected", socket.id);
        delete userSocketMap[userId];
    });
})

export {io,server}