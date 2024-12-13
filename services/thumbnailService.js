const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do generowania klatek
const generateThumbnails = (inputFile, outputDir, duration) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Brak pliku wejściowego'));
        }

        const timePoints = [
            duration * 0.1,
            duration * 0.15,
            duration * 0.2,
            duration * 0.25,
            duration * 0.3,
        ];

        const thumbnailDir = path.join(outputDir, 'thumbnail');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        const promises = timePoints.map((time, index) => {
            return new Promise((resolve, reject) => {
                const outputFile = path.join(thumbnailDir, `thumbnail_${index + 1}.jpg`);

                ffmpeg(inputFile)
                    .screenshots({
                        timestamps: [time],
                        filename: path.basename(outputFile),
                        folder: thumbnailDir,
                        size: '640x?',
                    })
                    .on('end', () => resolve(outputFile))
                    .on('error', reject);
            });
        });

        Promise.all(promises)
            .then(resolve)
            .catch(reject);
    });
};

module.exports = { generateThumbnails };
