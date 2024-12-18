const amqp = require('amqplib');

const RABBITMQ_URL = process.env.CONVERTER_SERVICE_RABBITMQ_URL;

let channel;

async function connectRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

async function sendToQueue(queue, message) {
    if (!channel) {
        console.error('RabbitMQ channel is not initialized');
        return;
    }
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message sent to queue "${queue}":`, message);
}

async function consumeQueue(queue, callback) {
    if (!channel) {
        console.error('RabbitMQ channel is not initialized');
        return;
    }
    await channel.assertQueue(queue);
    channel.consume(queue, (msg) => {
        if (msg !== null) {
            const messageContent = JSON.parse(msg.content.toString());
            console.log(`Received message from queue "${queue}":`, messageContent);
            callback(messageContent);
            channel.ack(msg);
        }
    });
}

module.exports = { connectRabbitMQ, sendToQueue, consumeQueue };
