const express = require('express');
const { sendToQueue } = require('../services/rabbitmq');

const router = express.Router();
router.post('/send-to-queue/:dirname', (req, res) => {
    const { dirname } = req.body;
    console.log({
        a13: '********',
        dirname,
    })
    if (!dirname) {
        return res.status(400).send('dirname is required!');
    }

    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue('upload_queue', { filePath });
        res.status(200).send(`Message with filePath ${filePath} sent to queue`);
    } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).send('Failed to send message to queue');
    }
});

module.exports = router;