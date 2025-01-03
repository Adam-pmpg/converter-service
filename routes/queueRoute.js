const express = require('express');
const { sendToQueue, CONVERSION_QUEUE } = require('../services/rabbit/rabbitmq');

const router = express.Router();
router.post('/send-to-queue/', (req, res) => {
    const { responseFromChunkUploader } = req.body;
    const outputFile  = responseFromChunkUploader && responseFromChunkUploader.outputFile ? responseFromChunkUploader.outputFile : '';
    if (!outputFile) {
        return res.status(400).send('Brak ścieżki do scalonego pliku oryginału!');
    }

    run(res, responseFromChunkUploader);
});

async function run(res, data) {
    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue(CONVERSION_QUEUE, { data });
        let outputFile = data && data.outputFile ? data.outputFile : '';
        let folderId = data && data.folderId ? data.folderId : '';
        res.status(200).json({message:`Wiadomość wysłana na kolejkę\noryginalne wideo: ${folderId}`});
    } catch (error) {
        console.error('Błąd wysyłania wiadomości do kolejki:', error);
        res.status(500).json({message:'Błąd wysyłania wiadomości do kolejki!'});
    }
}

module.exports = router;