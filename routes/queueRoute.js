const express = require('express');
const { sendToQueue } = require('../services/rabbit/rabbitmq');
const QUEUE_NAME = 'conversion_tasks';

const router = express.Router();
router.post('/send-to-queue/', (req, res) => {
    const { filePath, requestBody } = req.body;
    console.log({
        a21: '***********',
        filePath,
        body: req.body,
    })

    if (!filePath) {
        return res.status(400).send('filePath is required!');
    }
    run(res, filePath, requestBody);
});

async function run(res, filePath, data) {
    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue(QUEUE_NAME, { data });
        res.status(200).json({message:`Message with filePath ${filePath} sent to queue`});
    } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).json({message:'Failed to send message to queue'});
    }
}

module.exports = router;