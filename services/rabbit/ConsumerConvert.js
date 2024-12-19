const amqp = require('amqplib');
const { connectRabbitMQ, getQueueName } = require('./rabbitmq.js');
const { convertToHLS } = require('../converterService.js'); // Twoja funkcja konwersji wideo

async function consumeQueue() {
    try {
        const { channel, queue } = await connectRabbitMQ();

        console.log('Konsument nasłuchuje na kolejce:', queue );
        channel.prefetch(1); // Odbieranie jednej wiadomości na raz

        channel.consume(queue, async (msg) => {
            const { data } = JSON.parse(msg.content.toString()); // Rozpakowanie wiadomości

            console.log('Przetwarzanie zadania:', data);
            try {
                /** @ToDo: muszę w Rabbit wstrzykiwać potrzebne data */
                console.log({
                    a31: '********',
                    x: "w Rabbit-a muszę wstrzyknąć potrzebne dane do uruchomienia convertToHLS()"
                })
                // const { inputFile, outputDir, options } = data;
                //await convertToHLS(inputFile, outputDir, options); // Rozpoczęcie konwersji wideo

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

module.exports = { consumeQueue };
