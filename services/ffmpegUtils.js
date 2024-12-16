const ffmpeg = require('fluent-ffmpeg');

/**
 * Funkcja do pobierania czasu trwania wideo
 *
 * @param inputFile
 * @returns {Promise<unknown>}
 */
const getVideoDuration = (inputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFile, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
};

/**
 * Funkcja do pobierania metadanych wideo
 *
 * @param inputFile
 * @returns {Promise<unknown>}
 */
const getVideoMetadata = (inputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFile, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata);
        });
    });
};

/**
 * Funkcja do pobierania rozdzielczości wideo
 *
 * @param inputFile
 * @returns {Promise<unknown>}
 */
const getVideoResolution = (inputFile) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputFile, (err, metadata) => {
            if (err) return reject(err);
            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
            if (!videoStream) {
                return reject(new Error('Nie znaleziono strumienia wideo'));
            }
            resolve({ width: videoStream.width, height: videoStream.height });
        });
    });
};
module.exports = { getVideoDuration, getVideoMetadata, getVideoResolution };
