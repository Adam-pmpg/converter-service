const express = require('express');
const { sendToQueue, CONVERSION_QUEUE } = require('../services/rabbit/rabbitmq');
const {startConsumer} = require("../services/rabbit/ConsumerConvert");

const router = express.Router();

router.post('/start', (req, res) => {
    startConsumer();

    return res.status(200).json({message:`Manually start queue`});
});

router.post('/send-to-queue/', (req, res) => {
    const { responseFromChunkUploader } = req.body;
    const mergedFile  = responseFromChunkUploader && responseFromChunkUploader.mergedFile ? responseFromChunkUploader.mergedFile : '';
    if (!mergedFile) {
        return res.status(400).send('Brak ścieżki do scalonego pliku oryginału!');
    }

    run(res, responseFromChunkUploader);
});

async function run(res, data) {
    try {
        // Wyślij wiadomość do RabbitMQ
        await sendToQueue(CONVERSION_QUEUE, { data });
        let folderId = data && data.folderId ? data.folderId : '';
        res.status(200).json({message:`Wiadomość wysłana na kolejkę do konwersji\noryginalne wideo: ${folderId}`});
    } catch (error) {
        console.error('Błąd wysyłania wiadomości do kolejki:', error);
        res.status(500).json({message:'Błąd wysyłania wiadomości do kolejki!'});
    }
}

module.exports = router;