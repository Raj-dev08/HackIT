import express from 'express'
import dotenv from 'dotenv'
import { redis } from './utils/redis.js';
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { proxyRequest } from './middleware/proxy.middleware.js';
import cors from "cors";


dotenv.config();

const PORT=process.env.PORT

const app=express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args), 
  }),
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // max 10 requests per IP per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler:(req,res)=>{
    res.status(429).json({messsage:"Too many requests",success:"false"})
  }
});

app.use(limiter);

//auth service
app.use("/v1/auth", (req, res) =>
  proxyRequest(req, res, process.env.IDENTITY_AUTH_URL, "v1/auth")
);

app.use("/v1/service", (req,res) =>
  proxyRequest(req, res, process.env.IDENTITY_SERVICE_URL, "v1/service")
)
app.use("/v1/friend", (req,res) =>
  proxyRequest(req, res, process.env.IDENTITY_FRIEND_URL, "v1/friend")
)
app.use("/v1/message", (req,res) =>
  proxyRequest(req, res, process.env.IDENTITY_MESSAGE_URL, "v1/message")
)



app.listen(PORT,()=>{
    console.log("running on "+ PORT)
})