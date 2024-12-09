const Joi = require('joi');
const { convertToHLS } = require('../services/converterService');
const path = require('path');
const fs = require('fs');

module.exports = [
    {
        method: 'GET',
        path: '/video/convert',
        handler: (request, h) => {
            return { message: 'Video conversion in progress...' };
        }
    },
    {
        method: 'GET',
        path: '/video/convert/{filename}',
        options: {
            validate: {
                params: Joi.object({
                    filename: Joi.string().required(), // Sprawdzamy, czy nazwa pliku jest przekazana
                }),
            },
        },
        handler: async (request, h) => {
            const { filename } = request.params; // Pobranie nazwy pliku z URL
            const inputFile = path.join(__dirname, '../output', filename, `${filename}.mp4`); // Ścieżka do pliku MP4
            const outputDir = path.join(__dirname, '../output', filename, 'hls'); // Ścieżka do katalogu wynikowego HLS

            // Sprawdzenie, czy plik istnieje
            if (!fs.existsSync(inputFile)) {
                return h.response({ error: 'Input file not found' }).code(404);
            }

            // Sprawdzenie, czy katalog wyjściowy istnieje, jeśli nie, to go tworzymy
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            try {
                // Wywołanie funkcji konwertującej do HLS
                await convertToHLS(inputFile, outputDir);

                return h.response({
                    message: 'Conversion successful',
                    outputDir: outputDir, // Zwracamy ścieżkę, gdzie zapisano pliki HLS
                }).code(200);
            } catch (error) {
                return h.response({ error: error.message }).code(500);
            }
        },
    },
    {
        method: 'POST',
        path: '/video/convert',
        handler: async (request, h) => {
            const payload = request.payload; // Obsługa danych wejściowych
            return { message: 'Video conversion started!', data: payload };
        }
    }
];
