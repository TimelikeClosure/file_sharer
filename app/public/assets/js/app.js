"use strict";

const socket = io();

document.addEventListener('DOMContentLoaded', event => {
    const elements = {
        mode_current: document.getElementById('mode_selected'),
        mode_select: document.getElementById('transfer_mode_select'),
        connect_code: document.getElementById('connect_code'),
        device_code: document.getElementById('device_code'),
        device_pair: document.getElementById('device_pair_request'),
    };

    elements.mode_select.addEventListener('submit', (event) => {
        event.preventDefault();
        socket.emit('set_mode', event.target.elements.transfer_mode.value);
    });

    socket.on('mode_set', message => {
        if (message.mode === null){
            elements.mode_current.innerText = "What do you want to do?";
            elements.device_code.innerText = "";

            elements.mode_select.classList.remove('hidden');
            elements.connect_code.classList.add('hidden');
            elements.device_pair.classList.add('hidden');
        } else if (['send', 'receive'].includes(message.mode)){
            elements.mode_current.innerText = `Pair with another device as a file ${message.mode === 'send' ? 'send' : 'receiv'}er`;
            elements.device_code.innerText = message.id;

            elements.mode_select.classList.add('hidden');
            elements.connect_code.classList.remove('hidden');
            elements.device_pair.classList.remove('hidden');
        }
    });

    document.getElementById('other_device_code').addEventListener('change', (event) => {
        event.target.value = event.target.value.toUpperCase();
        if (event.target.value.length === 5){
            document.getElementById('pair_request_submit').removeAttribute('disabled');
        } else {
            document.getElementById('pair_request_submit').setAttribute('disabled', 'disabled');
        }
    });

    elements.device_pair.addEventListener('submit', (event) => {
        event.preventDefault();
        document.getElementById('pair_request_submit').setAttribute('disabled', 'disabled');
        document.getElementById('other_device_code').setAttribute('disabled', 'disabled');
        socket.emit('request_pair', event.target.elements.other_device_code.value);
    });

    socket.on('pair_matched', message => {
        elements.mode_select.classList.add('hidden');
        elements.connect_code.classList.add('hidden');
        elements.device_pair.classList.add('hidden');
        if (message.mode === 'send'){
            elements.mode_current.innerText = "Use the form to upload files";
        } else if (message.mode === 'receive'){
            elements.mode_current.innerText = "Waiting for sent files...";
        }
    });
});
