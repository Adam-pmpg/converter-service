const express = require('express');
const { generateToken } = require('../auth/tokenGenerator');
const router = express.Router();

router.post('/login', (req, res) => {
    const { username, password } = req.body;  // Oczekujemy w ciele żądania nazwy użytkownika i hasła

    const envUsername = process.env.CONVERTER_SERVICE_JWT_USER_LOGIN;
    const envUserPss = process.env.CONVERTER_SERVICE_JWT_USER_PASS;

    if (username === envUsername && password === envUserPss) {
        const user = {
            id: 1,
            username: envUsername,
        };
        const token = generateToken(user);

        return res.json({ token });
    }

    res.status(401).json({ message: 'Invalid credentials' });
});

module.exports = router;