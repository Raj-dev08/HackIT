import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../model/message.model.js";
import { sendMessage } from "../kafka/producer.js";
import { clearMessageCache } from "../controller/message.controller.js";


const meetingWorker = new Worker("message-queue", async (job) => {
    switch (job.name) {
        case "saveMessage": {
            const { tempId , sender , receiverId , text , image} = job.data

            let imageUrl;

            if(image){
                const uploadedResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadedResponse.secure_url;
            }

            const message = new Message({
            senderId: sender._id,
            receiverId,
            text,
            image: imageUrl,
            });

            await message.save();

            await clearMessageCache(sender._id, receiverId);
            await clearMessageCache(receiverId, sender._id);

            await sendMessage({
                type:"message-sent",
                receiverId:receiverId,
                sender: sender,
                message:message,
                tempId
            });
            break;
        }
        
        case "editMessage": {
            const { messageId, senderId, text, image } = job.data;

            const message = await Message.findById(messageId);

            if (!message) throw new Error("Message not found");

            if (message.senderId.toString() !== senderId.toString()) throw new Error("Unauthorized edit");

            // Only allow edits within 15 mins
            if (message.createdAt.getTime() < Date.now() - 15 * 60 * 1000) {
                throw new Error("Edit time window expired");
            }

            if (text){
                message.text = text;
            }
            if (image?.trim()) {
                const uploaded = await cloudinary.uploader.upload(image);
                message.image = uploaded.secure_url;
            }

            message.isEdited = true;

            await message.save();

            await clearMessageCache(senderId, message.receiverId);
            await clearMessageCache(message.receiverId, senderId);

            await sendMessage({
                type: "message-edited",
                receiverId: message.receiverId,
                message,
                senderId
            });

            break;
        }

        default:
            break;
    }
   
}, {
    connection: redis
});

meetingWorker.on("completed", (job) => {
    console.log(`Job ${job.name} completed successfully`);
});

meetingWorker.on("failed", (job, err) => {
    console.error(`Job ${job.name} failed with error: ${err.message}`);
});