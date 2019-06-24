"use strict";

const { resolve } = require('path');

const config = require(resolve('.', 'config'));
const utils = require(resolve('.', 'utils'));

const express = require('express');
const SocketIO = require('socket.io');

const app = express();
const http = require('http').createServer(app);
const io = SocketIO(http);

const clientDir = resolve(__dirname, 'public');

app.use(express.static(resolve(clientDir)));

const socketIOClient = resolve('.', 'node_modules', 'socket.io-client', 'dist', 'socket.io.js');
app.get('/assets/js/socket-io.js', (req, res) => {
    res.sendFile(socketIOClient);
});

app.get('/', (req, res) => {
    res.sendFile(resolve(clientDir, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(resolve(clientDir, '404.html'));
});

io.on('connection', (socket) => {
    console.log('Hiyo to the IO');
});

const PORT = config.env.PORT || 4321;
http.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
