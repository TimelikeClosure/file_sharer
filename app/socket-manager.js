"use strict";

const sockets = new Map();

module.exports = exports = (io) => {
    io.on('connection', (socket) => {
        sockets.set(socket, { role: null });
        console.log(new Date() + ': Hiyo to the IO');
        socket.on('disconnect', () => {
            console.log(new Date() + ': Biyo to the IO');
            sockets.delete(socket);
        });

        socket.on('set_mode', mode => {
            console.log(`New mode set: ${mode}`);
        });
    });
};
