const express = require('express');
const { sendToQueue } = require('../services/rabbitmq');

const router = express.Router();
router.post('/send-to-queue/', (req, res) => {
    const { filePath, message } = req.body;
    console.log({
        a13: '**** send-to-queue/ ****',
        filePath,
        message,
    })
    if (!filePath) {
        return res.status(400).send('dirname is required!');
    }
    run(res, filePath);
});

async function run(res, filePath) {
    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue('upload_queue', { filePath });
        res.status(200).send(`Message with filePath ${filePath} sent to queue`);
    } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).send('Failed to send message to queue');
    }
}

module.exports = router;