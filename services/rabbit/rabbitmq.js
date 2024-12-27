const amqp = require('amqplib');
const {func} = require("joi");

const RABBITMQ_URL = process.env.CONVERTER_SERVICE_RABBITMQ_URL;
const QUEUE_NAME = 'conversion_tasks';

let channel;
let connection;

// Funkcja łącząca z RabbitMQ i inicjalizująca kanał
async function connectRabbitMQ() {
    if (channel && connection) {
        // Jeśli połączenie i kanał już istnieją, nie wykonuj nic
        return { channel, connection };
    }

    try {
        // Inicjalizuj połączenie z RabbitMQ
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel(); // Tworzymy kanał
        console.log('Connected to RabbitMQ');
        channel.assertQueue(QUEUE_NAME, { durable: true });
        return { connection, channel, queue: QUEUE_NAME };
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

// Funkcja wysyłająca wiadomości do kolejki
async function sendToQueue(queue, message) {
    if (!channel || !connection) {
        // Jeśli kanał lub połączenie nie istnieją, połączymy się z RabbitMQ
        const { channel: newChannel } = await connectRabbitMQ();
        channel = newChannel;
    }

    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized');
    }

    await channel.assertQueue(queue); // Upewniamy się, że kolejka istnieje
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))); // Wysyłamy wiadomość
    console.log(`Message sent to queue "${queue}":`, message);
}

// Zamknięcie połączenia z RabbitMQ (jeśli konieczne)
async function closeConnection() {
    if (channel) {
        await channel.close();
    }
    if (connection) {
        await connection.close();
    }
    console.log('RabbitMQ connection closed');
}

module.exports = { connectRabbitMQ, sendToQueue, closeConnection, QUEUE_NAME };
