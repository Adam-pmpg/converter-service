const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { generateThumbnails } = require('./thumbnailService');
const { getVideoDuration } = require('./ffmpegUtils');

// Funkcja do konwersji MP4 na HLS
const convertToHLS = async (inputFile, outputDir, options = {}) => {
    const { dirname } = options;
    if (!fs.existsSync(inputFile)) {
        return reject(new Error('Brak pliku wejściowego'));
    }
    let duration;
    try {
        duration = await getVideoDuration(inputFile);
    } catch (err) {
        return reject(new Error('Nie udało się uzyskać czasu trwania wideo: ' + err.message));
    }
    // Wywołaj generowanie klatek
    try {
        console.log('Generowanie klatek...');
        let setup = {};
        setup.duration = duration;
        await generateThumbnails(inputFile, outputDir, setup);
        console.log('Klatki zostały wygenerowane.');
    } catch (err) {
        console.error('Błąd podczas generowania klatek:', err);
    }
    // Konwersja na HLS
    return new Promise((resolve, reject) => {
        const ffmpegCommand = ffmpeg(inputFile);
        // Czy taki default jest mi potrzebny ?
        // const ffmpegCommand = ffmpeg(inputFile).output(path.join(outputDir, 'oryginal_playlist-output.m3u8'));

        // Jeśli nie ma ustawionych rozdzielczości, przetwarzamy w natywnej rozdzielczości
        if (!options.resolutions || options.resolutions.length === 0) {
            options.resolutions = [
                { bitrate: '500k', resolution: '640x360', segmentFilename: `${dirname}_360p_%03d.ts`, playlist: `${dirname}_360p.m3u8` },
                { bitrate: '1000k', resolution: '1280x720', segmentFilename: `${dirname}_720p_%03d.ts`, playlist: `${dirname}_720p.m3u8` },
            ];
        }

        // Konwersja na różne rozdzielczości
        options.resolutions.forEach((res) => {
            ffmpegCommand.output(path.join(outputDir, res.playlist))
                .outputOptions([
                    '-f hls', // Format HLS
                    `-b:v ${res.bitrate}`, // Bitrate
                    `-s ${res.resolution}`, // Rozdzielczość
                    `-hls_time ${options.hls_time || 8}`, // Czas segmentu
                    `-hls_list_size ${options.hls_list_size || 0}`,
                    `-hls_segment_filename ${path.join(outputDir, res.segmentFilename)}`,
                ]);
        });

        ffmpegCommand
            .on('end', () => {
                console.log('Conversion to HLS, finished');
                resolve();
            })
            .on('error', (err) => {
                reject(err);
            })
            .run();

    });
};

module.exports = { convertToHLS };
