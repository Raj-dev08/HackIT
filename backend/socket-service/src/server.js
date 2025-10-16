import {server} from "./socket/socket.js"
import { connectConsumer } from "./kafka/consumer.js"
import dotenv from 'dotenv'
import { connectDB } from "./lib/db.js"

dotenv.config()

const PORT = process.env.PORT

connectConsumer().catch(console.error)

server.listen(PORT,()=>{
    console.log("Socket running on " + PORT)
    connectDB()
})
