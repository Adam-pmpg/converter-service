const express = require('express');
const { sendToQueue } = require('../services/rabbitmq');
const QUEUE_NAME = 'converter_service';

const router = express.Router();
router.post('/send-to-queue/', (req, res) => {
    const { filePath, message } = req.body;
    let data = {
        filePath,
        message,
    }

    if (!filePath) {
        return res.status(400).send('dirname is required!');
    }
    run(res, data);
});

async function run(res, data) {
    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue(QUEUE_NAME, { data });
        res.status(200).send(`Message with filePath ${data} sent to queue`);
    } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).send('Failed to send message to queue');
    }
}

module.exports = router;