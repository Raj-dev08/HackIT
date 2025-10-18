import { Worker } from "bullmq";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Message from "../model/message.model.js";
import { clearMessageCache } from "../controller/message.controller.js";
import { connectDB } from "../lib/db.js";
import { initProducer , sendMessage } from "../kafka/producer.js";

await connectDB();
await initProducer();

const meetingWorker = new Worker("message-queue", async (job) => {
    switch (job.name) {
        case "saveMessage": {
            const { tempId , sender , receiverId , text , image , textForSender , repliedTo} = job.data

            let imageUrl;

            if(image){
                const uploadedResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadedResponse.secure_url;
            }

            const message = new Message({
                senderId: sender._id,
                receiverId,
                text,
                textForSender,
                image: imageUrl,
                repliedTo
            });

            await message.save();
            await message.populate("repliedTo" , "text image textForSender senderId")

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
            const { messageId, senderId, text, image , textForSender} = job.data;

            const message = await Message.findById(messageId).populate("repliedTo" , "text image textForSender senderId");

            if (!message) {
                await sendMessage({
                    type: "edit-error",
                    info: "Message not found",
                    receiverId:senderId,
                    message
                });
                return ;
            };

            if (message.senderId.toString() !== senderId.toString()) {
                  await sendMessage({
                    type: "edit-error",
                    info: "Unauthorized edit",
                    receiverId:senderId,
                    message
                });
                return ;
            };

            // Only allow edits within 15 mins
            if (message.createdAt.getTime() < Date.now() - 15 * 60 * 1000) {
                  await sendMessage({
                    type: "edit-error",
                    info: "Edit window expired",
                    receiverId:senderId,
                    message
                });
                return ;
            }

            if (text){
                message.text = text;
                message.textForSender = textForSender //guarenteed if the text changes
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