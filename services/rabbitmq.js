const amqp = require('amqplib');

const RABBITMQ_URL = process.env.CONVERTER_SERVICE_RABBITMQ_URL;

let channel;
let connection;

// Funkcja łącząca z RabbitMQ i inicjalizująca kanał
async function connectRabbitMQ() {
    if (channel) {
        // Jeśli połączenie i kanał już istnieją, nie wykonuj nic
        return channel;
    }

    try {
        // Inicjalizuj połączenie z RabbitMQ
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel(); // Tworzymy kanał
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
        // Jeśli kanał nie jest zainicjalizowany, połączymy się z RabbitMQ
        await connectRabbitMQ();
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

module.exports = { connectRabbitMQ, sendToQueue };
