import { Kafka } from "kafkajs";
import { io ,getReceiverSocketId } from "../socket/socket.js";
import dotenv from 'dotenv'

dotenv.config()

const KAFKA_BROKER=process.env.KAFKA_BROKER

const kafka = new Kafka({
  clientId: "socket-service",
  brokers: [KAFKA_BROKER || "localhost:9092"]
});

const consumer = kafka.consumer({ groupId: "socket-service-group" });

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export const connectConsumer = async () => {
  let connected = false;

  while (!connected) {
    try {
      await consumer.connect();
      connected = true;
      console.log("Socket Service Kafka Consumer connected");
    } catch (err) {
      console.log("Kafka not ready, retrying in 5s...");
      await wait(5000);
    }
  }
  
  await consumer.subscribe({ topic: "friend-events", fromBeginning: true });
  await consumer.subscribe({ topic: "message-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString());
      if (topic == "friend-events"){
        const socketId=getReceiverSocketId(event.receiverId)
        switch (event.type) {

          case "friend-request-sent":
            console.log("Friend request event received in socket service for receiverId:", event.receiverId);
            io.to(socketId).emit("friend-request-received",{ sender:event.sender , request:event.request });
            break;

          case "friend-request-accepted":
            console.log("Friend request accepted event received in socket service for receiverId:", event.receiverId);
            io.to(socketId).emit("friend-request-accepted",{ acceptedBy: event.acceptedBy, requestId: event.requestId });
            break;

          default:
            console.log("Unknown event type:", event.type);
        }
      }

      else if (topic == "message-events"){
        const socketId=getReceiverSocketId(event.receiverId)
        let senderSocketId
        switch (event.type) {
            
          case "message-sent":
            senderSocketId = getReceiverSocketId(event.sender._id)       

            io.to(socketId).emit("new_message", { 
              sender : event.sender ,
              message : event.message
            });//send the message to the receiver

            io.to(senderSocketId).emit("message_sent",{
              receiverId:event.receiverId,
              tempId:event.tempId,
              message:event.message,
              stateOfMsg:"sent"
            })//update the status of message in the sender

            break;

          case "message-deleted":
            io.to(socketId).emit("message_deleted",event.messageId);
            break;

          case "message-edited":
            senderSocketId = getReceiverSocketId(event.senderId)

            io.to(socketId).emit("message_edited",event.message)

            io.to(senderSocketId).emit("message_edited_successfully",event.message)
            
            break;

          case "edit-error":
            io.to(socketId).emit("message-edit-failed",{ message : event.message , info: event.info})

            break;
          default:
            console.log("Unknown event type:", event.type);
        }
      }
     
    }
  });
};
