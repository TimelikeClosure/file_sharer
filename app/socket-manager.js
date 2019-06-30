"use strict";

const sockets = new Map();

const socketDisconnect = socket => () => {
    const pairedSocket = sockets.get(socket).pairedSocket;
    if (pairedSocket !== null){
        const pairedSocketStats = sockets.get(pairedSocket);
        if (pairedSocketStats.pairedSocket === socket){
            pairedSocketStats.mode = null;
            pairedSocketStats.pairedSocket = null;
            pairedSocket.emit('mode_set', { message: 'paired socket disconnected' });
        }
    }

    sockets.delete(socket);

    console.log(new Date() + ': Biyo to the IO');
};

const socketSetMode = socket => mode => {
    if (mode !== null && !['send', 'receive'].includes(mode)){
        return;
    }
    sockets.get(socket).mode = mode;
    socket.emit('mode_set', mode);

    console.log(`New mode set: ${mode}`);
};

module.exports = exports = (io) => {
    io.on('connection', (socket) => {
        const disconnect = socketDisconnect(socket);
        const setMode = socketSetMode(socket);

        sockets.set(socket, { mode: null, pairedSocket: null });

        socket.on('disconnect', disconnect);
        socket.on('set_mode', setMode);

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
