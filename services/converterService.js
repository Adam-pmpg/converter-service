const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do konwersji MP4 na HLS
const convertToHLS = (inputFile, outputDir, options = {}) => {
    console.log({
        a11: '**********',
        options,
        inputFile,
        outputDir,
    })
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Brak pliku wejściowego'));
        }

        const outputPath = path.join(outputDir, 'playlist-output.m3u8'); // Plik wyjściowy HLS (M3U8)
        const ffmpegCommand = ffmpeg(inputFile)
            .output(outputPath)
            .outputOptions([
                '-f hls', // Format HLS
                ...(options.hls_time ? [`-hls_time ${options.hls_time}`] : []), // Opcjonalne parametry
                ...(options.hls_list_size ? [`-hls_list_size ${options.hls_list_size}`] : []),
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
