const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const hlsFilesDir = process.env.HLS_FILES_DIR || '../hls-files';
const { connectRabbitMQ, CONVERSION_QUEUE } = require('./rabbitmq.js');
const { convertToHLS } = require('../converterService.js'); // konwersja wideo

async function consumeQueue() {
    try {
        const { conversionChannel } = await connectRabbitMQ();

        console.log('Konsument nasłuchuje na kolejce:', CONVERSION_QUEUE );
        conversionChannel.prefetch(1); // Odbieranie jednej wiadomości na raz

        conversionChannel.consume(CONVERSION_QUEUE, async (msg) => {
            if (!msg) {
                console.error('Brak wiadomości: Konsument RabbitMQ nie otrzymał żadnych danych.');
                return;
            }
            try {
                const { data } = JSON.parse(msg.content.toString()); // Rozpakowanie wiadomości
                console.log('Przetwarzanie zadania:', data);

                let options = {};
                options.dirname = data && data.folderId ? data.folderId : '';
                options.mode = "run from Consumer";

                let inputFile = data && data.outputFile ? data.outputFile : '';
                let outputDir = path.resolve(__dirname, '../', hlsFilesDir, options.dirname);

                // return true;
                await convertToHLS(inputFile, outputDir, options); // Rozpoczęcie konwersji wideo

                conversionChannel.ack(msg); // Potwierdzenie przetworzenia wiadomości
            } catch (error) {
                console.error('Błąd podczas konwersji:', error);
                conversionChannel.nack(msg, false, true); // Wiadomość wraca do kolejki w przypadku błędu
            }
        });
    } catch (error) {
        console.error('Błąd konsumenta RabbitMQ:', error);
    }
}

async function startConsumer() {
    let retries = 5;
    while (retries > 0) {
        try {
            await connectRabbitMQ(); // Sprawdzenie połączenia
            console.log('Połączono z RabbitMQ.');
            await consumeQueue();
            break; // Jeśli działa, przerwij pętlę
        } catch (error) {
            console.error('Nie udało się połączyć z RabbitMQ, ponawianie...', error);
            retries--;
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poczekaj 5 sekund
        }
    }
    if (retries === 0) {
        console.error('Nie udało się połączyć z RabbitMQ po 5 próbach.');
    }
}

module.exports = { consumeQueue, startConsumer };
