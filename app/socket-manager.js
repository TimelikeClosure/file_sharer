"use strict";

const sockets = new Map();

const lobbySockets = Object.freeze({
    send: new Map(),
    receive: new Map(),
});

function pipeline(...pipes){
    return pipelineInput => pipes.reduce(
        (pipeInput, pipe) => pipe(pipeInput),
        pipelineInput
    );
}

function pipe(input, ...pipes){
    return pipeline(...pipes)(input);
}

function randomId(){
    let id = "";
    for (let i = 0; i < 5; i++){
        const charCode = 'A'.charCodeAt(0) + Math.floor(Math.random() * 26);
        id += String.fromCharCode(charCode);
    }
    return id;
}

const isSocketPaired = socket => (
    sockets.has(socket)
    && pipe(
        sockets.get(socket),
        socketStats => (
            ['send', 'receive'].includes(socketStats.mode)
            && socketStats.pairedSocket !== socket
            && sockets.has(socketStats.pairedSocket)
            && sockets.get(socketStats.pairedSocket).pairedSocket === socket
        )
    )
);

const socketDisconnect = socket => () => {
    const pairedSocket = sockets.get(socket).pairedSocket;
    if (pairedSocket !== null && sockets.has(pairedSocket)){
        const pairedSocketStats = sockets.get(pairedSocket);
        if (pairedSocketStats.pairedSocket === socket){
            socketSetMode(pairedSocket)(null);
        }
    }

    Object.keys(lobbySockets)
    .forEach(mode => {
        for (const id of lobbySockets[mode].keys()){
            if (lobbySockets[mode].get(id) === socket){
                lobbySockets[mode].delete(id);
            }
        }
    });
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
    Object.keys(lobbySockets)
    .filter(key => key !== mode)
    .forEach(key => {
        lobbySockets[key].delete(response.id);
    });

    socket.emit('mode_set', response);

    console.log(`New mode set: ${mode}`);
};

const socketRequestPair = socket => device_code => {
    const socketStats = sockets.get(socket);
    // Exit if socket's mode isn't pairable
    const modes = ['send', 'receive'];
    if (!modes.includes(socketStats.mode)){ return }
    // Exit if socket is already paired
    if (
        socketStats.pairedSocket
        && sockets.get(socketStats.pairedSocket).pairedSocket === socket
    ){ return }
    // Exit if device_code doesn't exist
    const { mode } = socketStats;
    const pairedMode = modes[1 - modes.indexOf(mode)];
    if (!lobbySockets[pairedMode].has(device_code)){ return }
    // Set device as pair
    socketStats.pairedSocket = lobbySockets[pairedMode].get(device_code);
    // If pairing is mutual, create solidify pairing.
    if (sockets.get(socketStats.pairedSocket).pairedSocket === socket){
        createSocketPair(socket, socketStats.pairedSocket);
    }
};

const createSocketPair = (sendSocket, receiveSocket) => {
    const socketStats = {
        send: sockets.get(sendSocket),
        receive: sockets.get(receiveSocket),
    };

    if (
        socketStats.send.mode === 'receive'
        && socketStats.receive.mode === 'send'
    ){ return createSocketPair(receiveSocket, sendSocket) }
    if (
        socketStats.send.mode !== 'send'
        || socketStats.receive.mode !== 'receive'
    ){ return void undefined }

    lobbySockets.send.delete(sendSocket);
    lobbySockets.receive.delete(receiveSocket);

    receiveSocket.emit('pair_matched', { mode: socketStats.receive.mode });
    sendSocket.emit('pair_matched', { mode: socketStats.send.mode });
};

module.exports = exports = (io) => {
    io.on('connection', (socket) => {
        const disconnect = socketDisconnect(socket);
        const setMode = socketSetMode(socket);
        const requestPair = socketRequestPair(socket);

        sockets.set(socket, {
            mode: null,
            pairedSocket: null,
        });

        socket.on('disconnect', disconnect);
        socket.on('set_mode', setMode);
        socket.on('request_pair', requestPair);

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
