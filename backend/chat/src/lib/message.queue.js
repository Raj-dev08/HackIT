import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const messageQueue = new Queue("message-queue",{
    connection: redis
})