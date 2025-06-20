const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const hlsFilesDir = process.env.HLS_FILES_DIR || '../hls-files';
const { generateThumbnails } = require('../services/thumbnailService');
const { getVideoDuration } = require('../services/ffmpegUtils');

const router = express.Router();

router.post('/generate-thumbnails/:dirname', async (req, res) => {
    try {
        const { dirname } = req.params; // Pobieranie nazwy folderu z URL
        const { second, size } = req.body;
        const setup = {
            second,
            size
        };
        const inputFile = path.join(__dirname, '../merged-files', dirname, `${dirname}.mp4`);
        const mergedFiles = path.join(__dirname, hlsFilesDir, dirname);

        if (!fs.existsSync(inputFile)) {
            return res.status(404).json({ error: 'Brak folderu wejściowego #102' });
        }
        if (!fs.existsSync(mergedFiles)) {
            fs.mkdirSync(mergedFiles, { recursive: true });
        }

        // Oblicz czas trwania wideo
        const duration = await getVideoDuration(inputFile);
        setup.duration = duration;

        await generateThumbnails(inputFile, mergedFiles, setup);

        return res.status(200).json({
            message: 'Stopklatki zostały wygenerowane',
            data: {
                second
            }

        });
    } catch (error) {
        console.error('Błąd generowania stopklatek:', error);
        return res.status(500).json({
            error: 'Nie udało się wygenerować stopklatki!',
            details: error.message
        });
    }
});

module.exports = router;
