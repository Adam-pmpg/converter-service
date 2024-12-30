const path = require('path');

const { connectRabbitMQ, QUEUE_NAME } = require('./rabbitmq.js');
const { convertToHLS } = require('../converterService.js'); // konwersja wideo

async function consumeQueue() {
    try {
        const { channel } = await connectRabbitMQ();

        console.log('Konsument nasłuchuje na kolejce:', QUEUE_NAME );
        channel.prefetch(1); // Odbieranie jednej wiadomości na raz

        channel.consume(QUEUE_NAME, async (msg) => {
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
                let outputDir = path.join('/app/output-hls', options.dirname);
                await convertToHLS(inputFile, outputDir, options); // Rozpoczęcie konwersji wideo

                channel.ack(msg); // Potwierdzenie przetworzenia wiadomości
            } catch (error) {
                console.error('Błąd podczas konwersji:', error);
                channel.nack(msg, false, true); // Wiadomość wraca do kolejki w przypadku błędu
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
