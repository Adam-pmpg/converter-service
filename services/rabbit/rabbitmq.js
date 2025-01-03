const amqp = require('amqplib');
const {func} = require("joi");

const RABBITMQ_URL = process.env.CONVERTER_SERVICE_RABBITMQ_URL;
const CONVERSION_QUEUE = 'conversion_tasks';

let conversionChannel;
let connection;

// Funkcja łącząca z RabbitMQ i inicjalizująca kanał
async function connectRabbitMQ() {
    if (conversionChannel && connection) {
        // Jeśli połączenie i kanał już istnieją, nie wykonuj nic
        return { conversionChannel, connection };
    }

    try {
        // Inicjalizuj połączenie z RabbitMQ
        connection = await amqp.connect(RABBITMQ_URL);
        conversionChannel = await connection.createChannel(); // Tworzymy kanał
        console.log('Połączono do RabbitMQ');
        conversionChannel.assertQueue(CONVERSION_QUEUE, { durable: true });
        return { connection, conversionChannel, queue: CONVERSION_QUEUE };
    } catch (error) {
        console.error('Problem z połączeniem do RabbitMQ:', error);
        throw error;
    }
}

// Funkcja wysyłająca wiadomości do kolejki
async function sendToQueue(queue, message) {
    if (!conversionChannel || !connection) {
        // Jeśli kanał lub połączenie nie istnieją, połączymy się z RabbitMQ
        const { conversionChannel: newChannel } = await connectRabbitMQ();
        conversionChannel = newChannel;
    }

    if (!conversionChannel) {
        throw new Error('Kanał RabbitMQ, nieutworzony!');
    }

    await conversionChannel.assertQueue(queue); // Upewniamy się, że kolejka istnieje
    conversionChannel.sendToQueue(queue, Buffer.from(JSON.stringify(message))); // Wysyłamy wiadomość
    console.log(`Wiadomość wysłana do kolejki "${queue}":`, message);
}

// Zamknięcie połączenia z RabbitMQ (jeśli konieczne)
async function closeConnection() {
    if (conversionChannel) {
        await conversionChannel.close();
    }
    if (connection) {
        await connection.close();
    }
    console.log('RabbitMQ - połącznie zamknięte');
}

module.exports = { connectRabbitMQ, sendToQueue, closeConnection, CONVERSION_QUEUE };
