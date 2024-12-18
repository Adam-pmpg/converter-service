require('dotenv').config();
const express = require('express');

const authenticateJWT = require('./middleware/authenticateJWT');

// Importowanie tras
const authRoutes = require('./routes/authRoutes');
const videoConverterRoute = require('./routes/videoConverter');
const thumbnailRoutes = require('./routes/thumbnailRoutes');
const aboutRoute = require('./routes/about');

const app = express();
const port = process.env.CONVERTER_SERVICE_HOST_PORT || 3005;
const host = process.env.CONVERTER_SERVICE_HOST || 'localhost';

// Middleware do parsowania JSON (jeśli jest potrzebne)
app.use(express.json());

// Rejestrowanie tras

app.use('/auth', authRoutes);
app.use('/about', aboutRoute);
app.use('/thumbnail', authenticateJWT, thumbnailRoutes);
app.use('/video', authenticateJWT, videoConverterRoute);

app.get('/', (req, res) => {
    res.status(200).send();
});

// Obsługa nieobsłużonych błędów
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Startowanie serwera
app.listen(port, () => {
    console.log(`Server running on http://${host}:${port}`);
});
