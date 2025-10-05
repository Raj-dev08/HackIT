import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from "cookie-parser";


import { serviceHandler } from './middleware/service.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDB } from './lib/db.js';
import { initProducer,disconnectProducer } from './kafka/producer.js';
import messageRoutes from "./routes/message.route.js"

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(compression({
  filter: (req, res) => {
    const contentType = res.getHeader('Content-Type') || '';
    return /json|text|javascript|css|html/.test(contentType);
  }
}));

app.use(serviceHandler);

app.use("/api",messageRoutes)

app.use(errorHandler)

const shutdown = async () => {
  console.log("Shutting down service...");
  await disconnectProducer();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


app.listen(PORT,()=>{
    console.log("Running on "+ PORT);
    connectDB();
    initProducer();
})