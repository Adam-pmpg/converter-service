const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do konwersji MP4 na HLS
const convertToHLS = (inputFile, outputDir, options = {}) => {
    console.log({
        a13: '**********',
        options,
        inputFile,
        resolutions: options.resolutions,
        outputDir,
    })
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Brak pliku wejściowego'));
        }

        const ffmpegCommand = ffmpeg(inputFile).output(path.join(outputDir, 'oryginal_playlist-output.m3u8'));

        // Jeśli nie ma ustawionych rozdzielczości, przetwarzamy w natywnej rozdzielczości
        if (!options.resolutions || options.resolutions.length === 0) {
            let options.resolutions = [
                { bitrate: '500k', resolution: '640x360', segmentFilename: '360p_%03d.ts', playlist: '360p.m3u8' },
                { bitrate: '1000k', resolution: '1280x720', segmentFilename: '720p_%03d.ts', playlist: '720p.m3u8' },
            ];
        }

        // Konwersja na różne rozdzielczości
        options.resolutions.forEach((res) => {
            ffmpegCommand.output(path.join(outputDir, res.playlist))
                .outputOptions([
                    '-f hls', // Format HLS
                    `-b:v ${res.bitrate}`, // Bitrate
                    `-s ${res.resolution}`, // Rozdzielczość
                    `-hls_time ${options.hls_time || 10}`, // Czas segmentu
                    `-hls_segment_filename ${path.join(outputDir, res.segmentFilename)}`,
                ]);
        });

        ffmpegCommand
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
