"use strict";

const sockets = new Map();

const unpairedSocketDisconnect = socket => () => {
    console.log(new Date() + ': Biyo to the IO');
    sockets.delete(socket);
};

const unpairedSocketSetMode = socket => mode => {
    console.log(`New mode set: ${mode}`);
};

module.exports = exports = (io) => {
    io.on('connection', (socket) => {
        const unpairedDisconnect = unpairedSocketDisconnect(socket);
        const unpairedSetMode = unpairedSocketSetMode(socket);

        sockets.set(socket, { role: null });

        socket.on('disconnect', unpairedDisconnect);
        socket.on('set_mode', unpairedSetMode);

        console.log(new Date() + ': Hiyo to the IO');
    });
};

//  EVENTS (connect)

//  ^ connect

//  EVENTS (pairing)

//  ^ set_mode send
//  v mode_set mode: send, sender_id: <id>
//  ^ request_pair receiver_id: <id>

//  OR

//  ^ set_mode receive
//  v mode_set mode: receive, receiver_id: <id>
//  ^ request_pair sender_id: <id>

//  THEN

//  v pair_matched

//  EVENTS (transferring)
