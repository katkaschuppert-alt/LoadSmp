const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Reicht die index.html an den Browser weiter
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let botProcess = null;

// Route zum Starten des Bots
app.post('/api/start', (req, res) => {
    const token = req.body.token;

    // Erstellt eine temporäre Konfigurationsdatei für den Bot (z.B. für Python)
    fs.writeFileSync('token.txt', token);

    // Startet die bot.py Datei auf dem PC des Users
    if (botProcess === null) {
        // Hier wird "python bot.py" auf dem PC ausgeführt
        botProcess = spawn('python', ['bot.py']);

        botProcess.stdout.on('data', (data) => {
            console.log(`Bot-Output: ${data}`);
        });

        botProcess.stderr.on('data', (data) => {
            console.error(`Bot-Fehler: ${data}`);
        });

        botProcess.on('close', (code) => {
            console.log(`Bot beendet mit Code ${code}`);
            botProcess = null;
        });

        return res.json({ success: true });
    } else {
        return res.json({ success: false, error: "Bot läuft bereits!" });
    }
});

// Route zum Stoppen des Bots
app.post('/api/stop', (req, res) => {
    if (botProcess !== null) {
        botProcess.kill();
        botProcess = null;
        return res.json({ success: true });
    }
    res.json({ success: false, error: "Kein Bot läuft." });
});

// Der lokale Server läuft auf dem PC des Users
app.listen(3000, () => {
    console.log("Hoster gestartet! Öffne http://localhost:3000 in deinem Browser.");
});
