"use strict";

const sockets = new Map();

const lobbySockets = Object.freeze({
    send: new Map(),
    receive: new Map(),
});

function randomId(){
    let id = "";
    for (let i = 0; i < 5; i++){
        const charCode = 'A'.charCodeAt(0) + Math.floor(Math.random() * 26);
        id += String.fromCharCode(charCode);
    }
    return id;
}

const socketDisconnect = socket => () => {
    const pairedSocket = sockets.get(socket).pairedSocket;
    if (pairedSocket !== null){
        const pairedSocketStats = sockets.get(pairedSocket);
        if (pairedSocketStats.pairedSocket === socket){
            socketSetMode(pairedSocket)(null);
        }
    }

    sockets.delete(socket);

    console.log(new Date() + ': Biyo to the IO');
};

const socketSetMode = socket => mode => {
    const oldMode = sockets.get(socket).mode;
    if (
        (
            mode !== null
            && !['send', 'receive'].includes(mode)
        )
        || mode === oldMode
    ){ return }

    const response = {
        mode,
    };
    if (mode !== null){
        do {
            response.id = randomId();
        } while (lobbySockets[mode].has(response.id));
        lobbySockets[mode].set(response.id, socket);
    }
    sockets.get(socket).mode = mode;

    socket.emit('mode_set', response);

    console.log(`New mode set: ${mode}`);
};

module.exports = exports = (io) => {
    io.on('connection', (socket) => {
        const disconnect = socketDisconnect(socket);
        const setMode = socketSetMode(socket);

        sockets.set(socket, {
            mode: null,
            pairedSocket: null,
        });

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
