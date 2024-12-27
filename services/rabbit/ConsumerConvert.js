const amqp = require('amqplib');
const path = require('path');

const { connectRabbitMQ, QUEUE_NAME } = require('./rabbitmq.js');
const { convertToHLS } = require('../converterService.js'); // Twoja funkcja konwersji wideo

async function consumeQueue() {
    try {
        const { channel } = await connectRabbitMQ();

        console.log('Konsument nasłuchuje na kolejce:', QUEUE_NAME );
        channel.prefetch(1); // Odbieranie jednej wiadomości na raz

        channel.consume(QUEUE_NAME, async (msg) => {
            try {
                const { data } = JSON.parse(msg.content.toString()); // Rozpakowanie wiadomości
                console.log('Przetwarzanie zadania:', data);
                /** @ToDo: muszę w Rabbit wstrzykiwać potrzebne data */

                // const { inputFile, outputDir, options } = data;
                //await convertToHLS(inputFile, outputDir, options); // Rozpoczęcie konwersji wideo

                let options = {};
                options.dirname = data && data.folderId ? data.folderId : '';
                options.mode = "run from Cunsumer";

                let inputFile = data && data.outputFile ? data.outputFile : '';
                // let outputDir = '/app/output-hls/v-bdda1d43-f307-440a-8273-b696c916f976_original'
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
