import Message from "../model/message.model.js";
import { redis } from "../lib/redis.js";

import { sendMessage } from "../kafka/producer.js";
import { messageQueue } from "../lib/message.queue.js";


export const clearMessageCache = async (userId, receiverId) => {
  const pattern = `messages:${userId}:${receiverId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length) {
    await redis.del(keys);
  }
};

export const sendMsg = async (req, res, next) => {
  try {
    const { user } = req;
    const { text, image } = req.body;
    const receiverId = req.params.id;

    if (!receiverId || (!text && !image)) {
      return res.status(400).json({ message: "Recipient and text or image required" });
    }

    const tempId = Date.now().toString()

    await messageQueue.add("saveMessage",{
      tempId,
      sender:user,
      receiverId,
      text,
      image
    })

    return res.status(202).json({state:"queued",tempId,previewMsg:{text,image}});//sending the image so that u can give a default image by checking if image exists or not until it stores
  } catch (error) {
    next(error);
  }
}

export const getMessages = async (req, res, next) => {
    try {
        const { user } = req;
        const receiverId = req.params.id;
        const limit = parseInt(req.query.limit) || 100;
        const before = req.query.before;

        const cacheKey = `messages:${user._id}:${receiverId}:${limit}:${before}`;
        const cachedMessages = await redis.get(cacheKey);

        if (cachedMessages) {
            const parsedMessages = JSON.parse(cachedMessages);
            const {messages, hasMore} = parsedMessages;
            return res.status(200).json({ messages, hasMore });
        }

        const query = {
            $or: [
                { senderId: user._id, receiverId },
                { senderId: receiverId, receiverId: user._id }
            ]
        };

        if (before) {
            query.createdAt = { $lt: before };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)

        messages.reverse(); // To return the oldest messages first

        await Message.updateMany(
            { receiverId: user._id, senderId: receiverId, isSeen: false },
            { $set: { isSeen: true } }
        );

        const hasMore = messages.length === limit;

        const cacheData = {
            messages,
            hasMore
        };

        await redis.set(cacheKey, JSON.stringify(cacheData), "EX", 60 * 60); // Cache for 1 hour

        return res.status(200).json({ messages, hasMore });
    } catch (error) {
        next(error);
    }
}

export const deleteMessage = async (req, res, next) => {
  try {
    const { user } = req;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    if(message.createdAt < Date.now() - 24 * 60 * 60 * 1000) {
      return res.status(403).json({ message: "You can only delete messages within 24 hours" });
    }

    await Message.deleteOne({ _id: messageId });
    await clearMessageCache(user._id, message.receiverId);
    await clearMessageCache(message.receiverId, user._id);

    

    await sendMessage({
        type:"message-deleted",
        receiverId:message.receiverId,
        messageId
    })

   

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export const editMessage = async (req, res, next) => {
    try {
        const { user } = req;
        const messageId = req.params.id;
        const { text, image } = req.body;

        // console.log(req.body)


        if (!messageId) {
            return res.status(400).json({ message: "Message ID is required" });
        }
        if( !text && !image) {
            return res.status(400).json({ message: "Text or image is required to edit the message" });
        }
         
        await messageQueue.add("editMessage",{
          messageId,
          senderId:user._id,
          text,
          image
        })

        return res.status(202).json({ state: "edit-queued", messageId });
    } catch (error) {
        next(error);
    }
}

export const getUnreadMessagesCount = async (req, res, next) => {
    try {
        const { user } = req;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const unreadCount = await Message.countDocuments({
            receiverId: user._id,
            isSeen: false
        });

        return res.status(200).json({ unreadCount });
    } catch (error) {
        next(error);
    }
}