const express = require('express');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const { convertToHLS } = require('../services/converterService');

const router = express.Router();

// Trasa GET /video/convert
router.get('/convert', (req, res) => {
    res.json({ message: 'Video conversion in progress...' });
});

// Trasa GET /video/convert/:filename
router.get('/convert/:filename', (req, res) => {
    const { filename } = req.params; // Pobranie nazwy pliku z URL
    const inputFile = path.join(__dirname, '../output', filename, `${filename}.mp4`); // Ścieżka do pliku MP4
    const outputDir = path.join(__dirname, '../output', filename, 'hls'); // Ścieżka do katalogu wynikowego HLS

    // Sprawdzenie, czy nazwa pliku jest prawidłowa
    const filenameSchema = Joi.string().required();
    const { error } = filenameSchema.validate(filename);
    if (error) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    // Sprawdzenie, czy plik wejściowy istnieje
    if (!fs.existsSync(inputFile)) {
        return res.status(404).json({ error: 'Input file not found' });
    }

    // Sprawdzenie, czy katalog wyjściowy istnieje, jeśli nie, to go tworzymy
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Wywołanie funkcji konwertującej do HLS
    convertToHLS(inputFile, outputDir)
        .then(() => {
            res.status(200).json({
                message: 'Conversion successful',
                outputDir: outputDir, // Zwracamy ścieżkę, gdzie zapisano pliki HLS
            });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

// Trasa POST /video/convert
router.post('/convert', (req, res) => {
    const payload = req.body; // Obsługa danych wejściowych
    res.json({ message: 'Video conversion started!', data: payload });
});

module.exports = router;
