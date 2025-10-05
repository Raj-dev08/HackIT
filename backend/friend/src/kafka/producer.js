import { Kafka } from 'kafkajs'
import dotenv from 'dotenv'

dotenv.config()

const KAFKA_BROKER = process.env.KAFKA_BROKER

const kafka = new Kafka({
    clientId:"friend-service",
    brokers:[KAFKA_BROKER]
})

const producer = kafka.producer()

export const initProducer = async () => {
    await producer.connect()
    console.log("Kafka producer connected")
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