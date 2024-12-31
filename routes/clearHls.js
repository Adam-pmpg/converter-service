const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const hlsFilesDir = path.resolve(__dirname, '../', process.env.HLS_FILES_DIR || '../hls-files');

router.delete('/', (req, res) => {
    fs.rm(hlsFilesDir, { recursive: true, force: true }, (err) => {
        if (err) {
            console.error('Error while clearing the folder:', err);
            return res.status(500).send({
                message: 'Błąd podczas czyszczenia folderu',
                error: err.message,
            });
        }
        fs.mkdir(hlsFilesDir, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
                console.error('Error while recreating the folder:', mkdirErr);
                return res.status(500).send({
                    message: 'Błąd podczas odtwarzania folderu',
                    error: mkdirErr.message,
                });
            }

            res.status(200).send({
                message: 'Folder hls-files został wyczyszczony',
            });
        });
    });
});

module.exports = router;