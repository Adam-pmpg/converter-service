const express = require('express');
const path = require('path');
const { generateThumbnails } = require('../services/thumbnailService');
const { getVideoDuration } = require('../services/ffmpegUtils');

const router = express.Router();

router.post('/generate-thumbnails', async (req, res) => {
    try {
        const {inputFile, outputDir} = req.body;
        if (!inputFile || !outputDir) {
            return res.status(400).json({error: 'inputFile i outputDir są wymagane.'});
        }
    } catch (error) {
        console.error('Błąd generowania stopklatek:', error);
        return res.status(500).json({
            error: 'Nie udało się wygenerować stopklatek.',
            details: error.message
        });
    }
});

module.exports = router;
