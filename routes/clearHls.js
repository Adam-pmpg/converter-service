const express = require('express');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const hlsFilesDir = process.env.HLS_FILES_DIR || '../hls-files';
const mergedFilesHlsDir = path.join(__dirname, hlsFilesDir);

const clearFolder = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
            if (err) {
                return reject(`Błąd odczytu folderu ${dir}: ${err}`);
            }
            //czy folder pusty
            if (entries.length === 0) {
                return resolve(`Folder ${dir} jest już pusty.`);
            }

            // Usuwamy pliki lub podfoldery
            let deletionPromises = entries.map(entry => {
                const entryPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    // Rekurencyjnie usuwamy podfolder
                    return clearFolder(entryPath).then(() => {
                        return new Promise((resolve, reject) => {
                            fs.rmdir(entryPath, (err) => {
                                if (err) {
                                    reject(`Błąd usuwania folderu ${entryPath}: ${err}`);
                                } else {
                                    resolve(`Usunięto folder: ${entryPath}`);
                                }
                            });
                        });
                    });
                } else {
                    // Usuwamy plik
                    return new Promise((resolve, reject) => {
                        fs.unlink(entryPath, (err) => {
                            if (err) {
                                reject(`Błąd usuwania pliku ${entryPath}: ${err}`);
                            } else {
                                resolve(`Usunięto plik: ${entryPath}`);
                            }
                        });
                    });
                }
            });

            // Czekamy na zakończenie usuwania wszystkich plików
            Promise.all(deletionPromises)
                .then(results => resolve(results))
                .catch(error => reject(error));
        });
    });
};

router.delete('/', (req, res) => {
    Promise.all([clearFolder(mergedFilesHlsDir)])
        .then(results => {
            res.status(200).send({
                message: 'Foldery zostały wyczyszczone',
                details: results
            });
        })
        .catch(error => {
            res.status(500).send({
                message: 'Wystąpił błąd podczas czyszczenia folderów',
                error: error
            });
        });
});

// Endpoint do usuwania konkretnego folderu
router.delete('/:dirName', (req, res) => {
    const { dirName } = req.params;
    const specificDir = path.join(mergedFilesHlsDir, dirName);
    fs.access(specificDir, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send({
                message: `Folder ${dirName} nie istnieje`,
                error: err
            });
        }

        clearFolder(specificDir)
            .then(results => {
                fs.rmdir(specificDir, (err) => {
                    if (err) {
                        return res.status(500).send({
                            message: `Błąd podczas usuwania pojedynczego folderu ${dirName}`,
                            error: err
                        });
                    }

                    res.status(200).send({
                        message: `Pojedynczy folder ${dirName} został usunięty`,
                        details: results
                    });
                });
            })
            .catch(error => {
                res.status(500).send({
                    message: `Wystąpił błąd podczas usuwania zawartości pojedynczego folderu ${dirName}`,
                    error: error
                });
            });
    });
});

module.exports = router;