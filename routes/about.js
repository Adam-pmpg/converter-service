const express = require('express');
const router = express.Router();

// Definicja trasy
router.get('/', (req, res) => {
    res.send('<p>Converter Service version 1.0</p>');
});

module.exports = router;

