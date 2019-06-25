"use strict";

const socket = io();

document.addEventListener('DOMContentLoaded', event => {
    document.getElementById('transfer_mode_select').addEventListener('submit', (event) => {
        event.preventDefault();
        socket.emit('set_mode', event.target.elements.transfer_mode.value);
    });
});
