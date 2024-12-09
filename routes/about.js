// routes/video.js
module.exports = [
    {
        method: 'GET',
        path: '/about',
        handler: (request, h) => {
            return '<p>Converter Service version 1.0</p>';
        }
    }
];
