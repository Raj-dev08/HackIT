import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import cookieParser from "cookie-parser";


import { serviceHandler } from './middleware/service.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { connectDB } from './lib/db.js';
import hackathonRoutes from "./routes/hackathon.route.js"

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json({ limit: '50mb' }));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// app.use(compression({
//   filter: (req, res) => {
//     const contentType = res.getHeader('Content-Type') || '';
//     return /json|text|javascript|css|html/.test(contentType);
//   }
// }));

app.use(serviceHandler);

app.use("/api",hackathonRoutes)

app.use(errorHandler)

app.listen(PORT,()=>{
    console.log("Running on "+ PORT);
    connectDB();
})