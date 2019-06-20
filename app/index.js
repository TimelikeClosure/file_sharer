"use strict";

const { resolve } = require('path');

const config = require(resolve('.', 'config'));
const utils = require(resolve('.', 'utils'));

const express = require('express');

const app = express();

const clientDir = resolve(__dirname, 'public');

app.use(express.static(resolve(clientDir)));

app.get('/', (req, res) => {
    res.sendFile(resolve(clientDir, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(resolve(clientDir, '404.html'));
});

const PORT = config.env.PORT || 4321;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
