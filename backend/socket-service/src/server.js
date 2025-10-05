import {server} from "./socket/socket.js"
import { connectConsumer } from "./kafka/consumer.js"
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT

connectConsumer().catch(console.error)

server.listen(PORT,()=>{
    console.log("Socket running on " + PORT)
})
