const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do konwersji MP4 na HLS
const convertToHLS = (inputFile, outputDir) => {
    console.log({
        a11: '**********',
        inputFile,
        outputDir,
    })
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Input file not found'));
        }

        const outputPath = path.join(outputDir, 'output.m3u8'); // Plik wyjściowy HLS (M3U8)

        ffmpeg(inputFile)
            .output(outputPath)
            .outputOptions([
                '-hls_time 10', // Długość segmentu HLS w sekundach
                '-hls_list_size 0', // Brak limitu segmentów w liście
                '-f hls', // Format HLS
            ])
            .on('end', () => {
                console.log('Conversion finished');
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();
    });
};

module.exports = { convertToHLS };
