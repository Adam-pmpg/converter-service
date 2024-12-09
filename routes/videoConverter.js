// routes/video.js
module.exports = [
    {
        method: 'GET',
        path: '/video/convert',
        handler: (request, h) => {
            return { message: 'Video conversion in progress...' };
        }
    },
    {
        method: 'POST',
        path: '/video/convert',
        handler: async (request, h) => {
            const payload = request.payload; // Obsługa danych wejściowych
            return { message: 'Video conversion started!', data: payload };
        }
    }
];
