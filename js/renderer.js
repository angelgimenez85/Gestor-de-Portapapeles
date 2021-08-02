const { clipboard, remote } = require('electron');
const jQuery = require('jquery');
const dexie = require('dexie');

dixie.debug = true;
const historialPortapapeles = new dexie('historial');

let dato = jQuery('#dato');
let tablaPortapapeles = jQuery('#tablaPortapapeles');

remote.getCurrentWindow().on('show', () => {
    dato.trigger('focus');
});

jQuery('body').on('keydown', (e) => {
    
});