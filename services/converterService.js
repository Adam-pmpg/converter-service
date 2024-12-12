const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Funkcja do konwersji MP4 na HLS
const convertToHLS = (inputFile, outputDir, options = {}) => {
    console.log({
        a12: '**********',
        options,
        inputFile,
        resolutions: options.resolutions ? options.resolutions : 'brak',
        outputDir,
    })
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(inputFile)) {
            return reject(new Error('Brak pliku wejściowego'));
        }

        // Jeśli rozdzielczości nie są podane, używamy domyślnych
        const resolutions = options.resolutions || [
            { bitrate: '500k', resolution: '640x360', segmentFilename: '360p_%03d.ts', playlist: '360p.m3u8' },
            { bitrate: '1000k', resolution: '1280x720', segmentFilename: '720p_%03d.ts', playlist: '720p.m3u8' },
        ];

        const ffmpegCommand = ffmpeg(inputFile);
        resolutions.forEach((res) => {
            ffmpegCommand
                .output(path.join(outputDir, res.playlist))  // Ścieżka do playlisty
                .outputOptions([
                    '-f hls', // Format HLS
                    `-b:v ${res.bitrate}`, // Bitrate
                    `-s ${res.resolution}`, // Rozdzielczość
                    ...(options.hls_time ? [`-hls_time ${options.hls_time}`] : []), // Czas segmentu
                    ...(options.hls_list_size ? [`-hls_list_size ${options.hls_list_size}`] : []), // Liczba segmentów w playliście
                    `-hls_segment_filename ${path.join(outputDir, res.segmentFilename)}`, // Segmenty TS
                ]);
        });

        ffmpegCommand
            .on('end', () => {
                console.log('Conversion finished');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error during conversion:', err);
                reject(err);
            })
            .run();
    });
};

module.exports = { convertToHLS };
