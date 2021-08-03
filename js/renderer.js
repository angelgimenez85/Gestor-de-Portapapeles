const { clipboard, remote } = require('electron');
const jQuery = require('jquery');
const Dexie = require('dexie');
const popupS = require('popups');



Dexie.debug = true;
const bd = new Dexie('historial');

//const dato = jQuery('#dato');
const dato = document.querySelector('input');

dato.addEventListener('focus', () => {	   
    dato.select();
});

//const tablaPortapapeles = jQuery('#tablaPortapapeles');
const tablaPortapapeles = document.querySelector('table');

//tablaPortapapeles.on('click', cambiarDatoSeleccionado);
tablaPortapapeles.addEventListener('click', cambiarDatoSeleccionado);

remote.getCurrentWindow().on('show', () => {
    //dato.trigger('focus');
    dato.focus();
});

//jQuery('body').on('keydown', (e) => {
document.body.addEventListener('keydown', (e) => {

    //const filas = Array.from(jQuery('tr td:first-child'));
    let filas = Array.from(document.querySelectorAll('tr td:first-child'));
    let indice = filas.indexOf(document.activeElement);

    if (e.key === 'ArrowUp') {
        const siguienteDato = filas[indice - 1] || filas[filas.length - 1];
        siguienteDato.focus();

    } else if (e.key === 'ArrowDown') {
        const siguienteDato = filas[indice + 1] || filas[0];
        siguienteDato.focus();

    } else if (e.key === 'Enter') {
        cambiarDatoSeleccionado(e);

    } else if (e.key === 'Escape') {
        dato.value = '';
        refrescarVista();
        remote.getCurrentWindow().close();

    } else {
        //dato.trigger('focus');
        dato.focus();
        refrescarVista();
    }
});

async function cambiarDatoSeleccionado(e) {
    const id = e.target.id;

    if (id) {
        if (clipboard.readText() === (await bd.historial.get(parseInt(id))).texto) {
            return;
        }
    }

    if (e.target.tagName === 'TD') {
        clipboard.writeText((await bd.historial.get(parseInt(id))).texto);
    }

    // Eliminar una entrada de historial
    await bd.historial.delete(parseInt(e.target.id));

    refrescarVista();
}

function refrescarVista() {
    bd.historial.count((e) => {
        dato.placeholder = `Buscar entre ${e} elementos`;
    });

    return bd.historial.limit(50).desc()
        .filter((h) => {
            return !dato.value || h.texto.toLowerCase().indexOf(dato.value.toLowerCase()) !== -1;
        })
        .toArray()
        .then((h) => {
            //jQuery(tablaPortapapeles).remove();
            tablaPortapapeles.innerHTML = '';

            let indice = 0;

            h.forEach((elem) => {
                //const tr = jQuery('<tr>');
                const fila = document.createElement('tr');
                ++indice;
                fila.innerHTML = `<tr class="registros">
                                    <td tabindex="${indice}" id="${elem.id}"></td>
                                    <td class="align-middle">
                                        <button class="btn btn-danger btn-sm" id="${elem.id}">
                                            &#10006;
                                        </button>
                                    </td>
                                    </tr>`;
                //tr.append(`<tr>
                //            <td tabindex="${indice}" id="${elem.id}"></td>
                //            <td><button id="${e.id}">&#10006;</button></td>
                //            </tr>`);
                fila.querySelector('td').innerText = cortarTextoConPuntos(elem.texto.replace(/\n/g, ' '), 50);
                fila.addEventListener('click', mostrarTextoCompleto);
                //tablaPortapapeles.append(tr);
                tablaPortapapeles.appendChild(fila);
            });
        });
}

setTimeout(async () => {
    await bd.version(1).stores({historial: '++id, texto'});
    refrescarVista();

    let texto = clipboard.readText();
    setInterval(async () => {
        if (texto !== clipboard.readText()) {
            texto = clipboard.readText();
            bd.historial.add({texto: texto}).then(refrescarVista);
        }
    }, 200);
});

function cortarTextoConPuntos(texto, limite) {

    if(texto.length > limite)   {
        texto = texto.substring(0,limite) + "...";
    }

    return texto;
}

async function mostrarTextoCompleto(e) {
    const texto = (await bd.historial.get(parseInt(e.target.id))).texto;
    popupS.window({
        mode: 'modal',
        content: escapeHTML(texto)
    });
}

function escapeHTML(html) {
    var fn=function(tag) {
        var charsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&#34;'
        };
        return charsToReplace[tag] || tag;
    }
    return html.replace(/[&<>"]/g, fn);
}