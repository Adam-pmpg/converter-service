const express = require('express');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const { convertToHLS } = require('../services/converterService');

const router = express.Router();

router.post('/convert/multi-resolutions/:dirname', (req, res) => {
    const { dirname } = req.params; // Pobranie nazwy pliku z URL
    const { hls_time, hls_list_size , resolutions } = req.body;

    // Sprawdzenie, czy nazwa pliku jest prawidłowa
    const filenameSchema = Joi.string().required();
    const { error } = filenameSchema.validate(dirname);
    if (error) {
        return res.status(400).json({ error: 'Niewłaściwy format pliku wejściowego' });
    }

    // Ustawienia domyślne dla opcji HLS
    const options = {
        hls_time: parseInt(hls_time) || 10, // Długość segmentu w sekundach, domyślnie 10
        hls_list_size: parseInt(hls_list_size) || 0,
        resolutions: resolutions ? resolutions : [],// Brak limitu segmentów w liście, domyślnie 0
    };

    const inputFile = path.join(__dirname, '../output', dirname, `${dirname}.mp4`); // Ścieżka do pliku MP4
    const outputDir = path.join(__dirname, '../output-hls', dirname); // Ścieżka do katalogu wynikowego HLS

    // Sprawdzenie, czy plik wejściowy istnieje
    if (!fs.existsSync(inputFile)) {
        return res.status(404).json({ error: 'Brak pliku wejściowego #101' });
    }

    // Sprawdzenie, czy katalog wyjściowy istnieje, jeśli nie, to go tworzymy
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Wywołanie funkcji konwertującej do HLS
    convertToHLS(inputFile, outputDir, options)
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

router.post('/convert/:dirname', (req, res) => {
    const { dirname } = req.params; // Pobranie nazwy pliku z URL
    const { hls_time, hls_list_size } = req.body;

    // Sprawdzenie, czy nazwa pliku jest prawidłowa
    const filenameSchema = Joi.string().required();
    const { error } = filenameSchema.validate(dirname);
    if (error) {
        return res.status(400).json({ error: 'Niewłaściwy format pliku wejściowego' });
    }

    // Ustawienia domyślne dla opcji HLS
    const options = {
        hls_time: parseInt(hls_time) || 10, // Długość segmentu w sekundach, domyślnie 10
        hls_list_size: parseInt(hls_list_size) || 0, // Brak limitu segmentów w liście, domyślnie 0
    };

    const inputFile = path.join(__dirname, '../output', dirname, `${dirname}.mp4`); // Ścieżka do pliku MP4
    const outputDir = path.join(__dirname, '../output-hls', dirname); // Ścieżka do katalogu wynikowego HLS

    // Sprawdzenie, czy plik wejściowy istnieje
    if (!fs.existsSync(inputFile)) {
        return res.status(404).json({ error: 'Brak pliku wejściowego #101' });
    }

    // Sprawdzenie, czy katalog wyjściowy istnieje, jeśli nie, to go tworzymy
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Wywołanie funkcji konwertującej do HLS
    convertToHLS(inputFile, outputDir, options)
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

module.exports = router;
