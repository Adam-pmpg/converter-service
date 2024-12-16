const express = require('express');
const path = require('path');
const fs = require('fs');

const { generateThumbnails } = require('../services/thumbnailService');
const { getVideoDuration } = require('../services/ffmpegUtils');

const router = express.Router();

router.post('/generate-thumbnails/:dirname', async (req, res) => {
    try {
        const { dirname } = req.params; // Pobieranie nazwy folderu z URL
        const { frame, second } = req.body;
        const setup = {
            frame,
            second
        };
        const inputFile = path.join(__dirname, '../output', dirname, `${dirname}.mp4`);
        const outputDir = path.join(__dirname, '../output-hls', dirname );

        if (!frame && !second) {
            return res.status(400).json({error: 'Nie podałeś, którą stopklatkę!'});
        }
        if (!fs.existsSync(inputFile)) {
            return res.status(404).json({ error: 'Brak folderu wejściowego #102' });
        }
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Oblicz czas trwania wideo
        const duration = await getVideoDuration(inputFile);
        setup.duration = duration;

        await generateThumbnails(inputFile, outputDir, setup);

        return res.status(200).json({
            message: 'Stopklatki zostały wygenerowane',
            data: {
                second,
                frame,
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
