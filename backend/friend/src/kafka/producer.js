import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'

dotenv.config()

const KAFKA_BROKER = process.env.KAFKA_BROKER

const kafka = new Kafka({
    clientId:"friend-service",
    brokers:[KAFKA_BROKER]
})

const producer = kafka.producer()

const wait = (ms) => new Promise(res => setTimeout(res, ms))

export const initProducer = async () => {
    let connected = false
    while (!connected) {
        try {
            await producer.connect()
            connected = true
            console.log("Kafka producer connected")
        } catch (err) {
            console.log("Kafka not ready, retrying in 5s...")
            await wait(5000)
        }
    }
}

export const sendFriendEvent = async (event) => {
    await producer.send({
        topic:"friend-events",
        messages: [{ value : JSON.stringify(event) }]
    })
}

export const disconnectProducer = async () => {
    await producer.disconnect()
    console.log("Kafka disconnected")
}