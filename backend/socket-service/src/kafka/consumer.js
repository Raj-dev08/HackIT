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

export const connectConsumer = async () => {
  await consumer.connect();
  console.log("Socket Service Kafka Consumer connected");

  await consumer.subscribe({ topic: "friend-events", fromBeginning: true });
  await consumer.subscribe({ topic: "message-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString());

      if (topic == "friend-events"){
        const socketId=getReceiverSocketId(event.receiverId)
        switch (event.type) {
            
          case "friend-request-sent":           
            io.to(socketId).emit("friend-request-received",event.sender);
            break;

          case "friend-request-accepted":
            io.to(socketId).emit("friend-request-accepted",event.acceptedBy);
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
              tempId:event.tempId,
              realId:event.message._id,
              state:"sent"
            })//update the status of message in the sender

            break;

          case "message-deleted":
            io.to(socketId).emit("message_deleted",event.messageId);
            break;

          case "message-edited":
            senderSocketId = getReceiverSocketId(event.senderId)

            io.to(socketId).emit("message_edited",event.message)

            io.to(senderSocketId).emit("message_edited_successfully",{
              message:event.message,
              state:"edited"
            })
            break;
          default:
            console.log("Unknown event type:", event.type);
        }
      }
     
    }
  });
};
