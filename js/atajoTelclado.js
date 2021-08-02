const { remote, ipcRenderer } = require('electron');
const jQuery = require('jquery');
const settings = require('electron-settings');

let atajoTeclado = document.querySelector('input');
let btnReestablecer = document.querySelector("button[type='reset']");
let btnGuardarAtajoTeclado = document.querySelector("button[type='reset']");


remote.getCurrentWindow().on('show', async () => {
    atajoTeclado.focus();

    atajoTeclado.value = await settings.get('atajoTecladoGlobal');
});

let teclasAtajoTeclado = [];

document.body.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {

    } else if (e.key === 'Escape') {
        atajoTeclado.value = '';
        remote.getCurrentWindow().close();
    } else {
        atajoTeclado.focus();

        if (teclasAtajoTeclado.indexOf(e.key) === -1) {
            teclasAtajoTeclado.push(e.key);
        }

        atajoTeclado.value = teclasAtajoTeclado.join('+')
                                .replace('Control', 'CmdOrCtrl')
                                .replace('Arrow', '');
        return true;
    }
});

jQuery(btnReestablecer).on('click', () => {
    atajoTeclado.value = '';
    teclasAtajoTeclado = [];
    atajoTeclado.focus();
});

jQuery(btnGuardarAtajoTeclado).on('click', async () => {
    await settings.set('atajoTecladoGlobal', atajoTeclado.value);
    atajoTeclado.focus();
    remote.getCurrentWindow().close();
    ipcRenderer.send('finalizar-aplicacion');
});