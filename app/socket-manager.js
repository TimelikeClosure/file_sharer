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
