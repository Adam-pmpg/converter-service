require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/corsMiddleware');
const authenticateJWT = require('./middleware/authenticateJWT');
const { consumeQueue } = require('./services/rabbit/ConsumerConvert');

// Importowanie tras
const authRoutes = require('./routes/authRoutes');
const videoConverterRoute = require('./routes/videoConverter');
const thumbnailRoutes = require('./routes/thumbnailRoutes');
const aboutRoute = require('./routes/about');
const queueRoute = require('./routes/queueRoute');

const app = express();
const port = process.env.CONVERTER_SERVICE_HOST_PORT || 3005;
const host = process.env.CONVERTER_SERVICE_HOST || 'localhost';

// Middleware do parsowania JSON (jeśli jest potrzebne)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(corsMiddleware);

// Rejestrowanie tras
app.use('/auth', authRoutes);
app.use('/about', aboutRoute);
app.use('/thumbnail', authenticateJWT, thumbnailRoutes);
app.use('/video', authenticateJWT, videoConverterRoute);
app.use('/queue', queueRoute);

app.get('/', (req, res) => {
    res.status(200).send();
});

consumeQueue();

// Startowanie serwera
app.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});

// Obsługa nieobsłużonych błędów
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
