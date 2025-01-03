const express = require('express');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const { convertToHLS } = require('../services/converterService');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const hlsFilesDir = process.env.HLS_FILES_DIR || '../hls-files';

router.post('/convert/:dirname', (req, res) => {
    const { dirname } = req.params; // Pobieranie nazwy folderu z URL
    const { hls_time, hls_list_size , resolutions } = req.body;

    // Sprawdzenie, czy nazwa pliku jest prawidłowa
    const filenameSchema = Joi.string().required();
    const { error } = filenameSchema.validate(dirname);
    if (error) {
        return res.status(400).json({ error: 'Niewłaściwy format pliku wejściowego' });
    }

    // Ustawienia domyślne dla opcji HLS
    const options = {
        dirname,
        hls_time: parseInt(hls_time) || 10, // Długość segmentu w sekundach, domyślnie 10
        hls_list_size: parseInt(hls_list_size) || 0,
        resolutions: resolutions ? resolutions : [],// Brak limitu segmentów w liście, domyślnie 0
    };

    const inputFile = path.join(__dirname, '../merged-files', dirname, `${dirname}.mp4`); // Ścieżka do pliku MP4
    const outputHlsTempDir = path.join(__dirname, hlsFilesDir, dirname); // Ścieżka do katalogu wynikowego HLS

    // Sprawdzenie, czy plik wejściowy istnieje
    if (!fs.existsSync(inputFile)) {
        return res.status(404).json({ error: 'Brak pliku wejściowego #103' });
    }

    // Sprawdzenie, czy katalog wyjściowy istnieje, jeśli nie, to go tworzymy
    if (!fs.existsSync(outputHlsTempDir)) {
        fs.mkdirSync(outputHlsTempDir, { recursive: true });
    }

    // Wywołanie funkcji konwertującej do HLS
    convertToHLS(inputFile, outputHlsTempDir, options)
        .then(() => {
            res.status(200).json({
                message: 'Conversion successful',
                outputHlsDir: outputHlsTempDir, // Zwracamy ścieżkę, gdzie zapisano pliki HLS
            });
        })
        .catch((error) => {
            res.status(500).json({ error: error.message });
        });
});

module.exports = router;
