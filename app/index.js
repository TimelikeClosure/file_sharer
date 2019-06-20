"use strict";

const { resolve } = require('path');

const config = require(resolve('.', 'config'));
const utils = require(resolve('.', 'utils'));

const express = require('express');

const app = express();

app.use(express.static(resolve('.', 'public')));

app.get('*', (req, res) => {
    res.sendFile(resolve(__dirname, 'public', 'index.html'));
});

const PORT = config.env.PORT || 4321;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
