// routes/video.js
module.exports = [
    {
        method: 'GET',
        path: '/about',
        handler: (request, h) => {
            return '<p>hapi version 1.0</p>';
        }
    }
];
