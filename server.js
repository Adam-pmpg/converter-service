require('dotenv').config();

const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: process.env.CONVERTER_SERVICE_HOST_PORT || 3005,
        host: process.env.CONVERTER_SERVICE_HOST || 'localhost'
    });

    // Importowanie tras
    const videoRoutes = require('./routes/videoConverter');
    const aboutRoutes = require('./routes/about');

    // Rejestrowanie tras
    server.route(videoRoutes);
    server.route(aboutRoutes);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
