const amqp = require('amqplib');

const RABBITMQ_URL = process.env.CONVERTER_SERVICE_RABBITMQ_URL;

let channel;

// Funkcja łącząca z RabbitMQ i inicjalizująca kanał
async function connectRabbitMQ() {
    if (channel) {
        console.log('RabbitMQ connection already established');
        return channel;
    }

    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel(); // Tworzenie kanału
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}

// Funkcja wysyłająca wiadomości do kolejki
async function sendToQueue(queue, message) {
    if (!channel) {
        await connectRabbitMQ(); // Jeśli kanał nie istnieje, połącz ponownie
    }

    if (!channel) {
        throw new Error('RabbitMQ channel is not initialized');
    }

    await channel.assertQueue(queue); // Upewniamy się, że kolejka istnieje
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message))); // Wysyłamy wiadomość
    console.log(`Message sent to queue "${queue}":`, message);
}

module.exports = { connectRabbitMQ, sendToQueue };
