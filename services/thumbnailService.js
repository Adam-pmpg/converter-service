const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do generowania klatek
const generateThumbnails = (inputFile, outputDir, setup) => {
    const { duration, second,  size } = setup;
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Brak pliku wejściowego'));
        }
        if (!duration) {
            return reject(new Error('Brak informacji o czasie trwania video'));
        }
        let timePoints = [];
        if (second && second > duration) {
            console.warn(`Podany czas przekracza długość wideo. Ustawiamy czas na ${duration} sekund.`);
            timePoints = [duration];
        } else if (!second) {
            timePoints = [
                duration * 0.1,
                duration * 0.15,
                duration * 0.2,
                duration * 0.25,
                duration * 0.3,
            ];
        } else {
            timePoints = [
                second
            ];
        }

        const finalSize = size ? size : '480x?';

        const thumbnailDir = path.join(outputDir, 'thumbnail');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        const promises = timePoints.map((time, index) => {
            return new Promise((resolve, reject) => {
                const outputFile = path.join(thumbnailDir, `thumbnail_${index + 1}.jpg`);
                const resultSaveThumbnail = saveThumbnail(inputFile, time, outputFile, thumbnailDir, finalSize );
                resultSaveThumbnail
                    .on('end', () => resolve(outputFile))
                    .on('error', reject);
            });
        });

        Promise.all(promises)
            .then(resolve)
            .catch(reject);
    });
};

function saveThumbnail (inputFile, time, outputFile, thumbnailDir, size = "640x?" ) {
    return ffmpeg(inputFile)
        .screenshots({
            timestamps: [time],
            filename: path.basename(outputFile),
            folder: thumbnailDir, //folder, gdzie zapisujemy stopklatki
            size: size,
        });
}

module.exports = { generateThumbnails };
