"use strict";

const socket = io();

function renderView(view, locals = {}){
    const views = {
        home: {
            message: "What do you want to do?",
            shownIds: ['transfer_mode_select'],
        },
        send_pair: {
            message: "Pair with another device as a file sender",
            shownIds: ['connect_code', 'device_pair_request'],
        },
        receive_pair: {
            message: "Pair with another device as a file receiver",
            shownIds: ['connect_code', 'device_pair_request'],
        },
        send_ready: {
            message: "Use the form to upload files",
            shownIds: [],
        },
        receive_ready: {
            message: "Waiting for sent files...",
            shownIds: [],
        },
    };
    document.getElementById('mode_selected').innerText = views[view].message;
    const device_code = locals.device_code || "";
    document.getElementById('device_code').innerText = device_code;
    const oldShown = document.getElementsByClassName('shown');
    for (var oldShownIndex = oldShown.length - 1; oldShownIndex >= 0; oldShownIndex--){
        oldShown[oldShownIndex].classList.remove('shown');
    }
    views[view].shownIds.forEach(function(id){
        document.getElementById(id).classList.add('shown');
    });
}

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
            renderView('home');
        } else if (['send', 'receive'].includes(message.mode)){
            document.getElementById('pair_request_submit').setAttribute('disabled', 'disabled');
            document.getElementById('other_device_code').removeAttribute('disabled');
            document.getElementById('other_device_code').value = "";

            renderView(message.mode + "_pair", { device_code: message.id });
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
        renderView(message.mode + "_ready");
    });
});
