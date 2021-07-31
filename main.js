const { app, BrowserWindow, ipcMain, tray, Menu, globalShorcut, Tray } = require('electron');
const path = require('path');
const settings = require('electron-settings');

// Si ya existe una ejecución en curso
if (!app.requestSingleInstanceLock()) {
    app.quit();
}

async function iniciarAplicacion() {
    const ventanaPrincipal = new BrowserWindow({
        width: 400,
        height: 650,
        frame: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false,
        title: 'Clips de portapapeles',
        webPreferences: {
            preload: path.join(__dirname, 'js', 'preload.js'),
            nodeIntegration: true
        }
    });

    ventanaPrincipal.setMenuBarVisibility(false);
    ventanaPrincipal.loadFile('index.html');

    const atajoTecladoVentana = new BrowserWindow({
        width: 400,
        height: 650,
        frame: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false,
        title: 'Atajo de teclado',
        webPreferences: {
            nodeIntegration: true
        }
    });

    atajoTecladoVentana.setMenuBarVisibility(false);
    atajoTecladoVentana.loadFile('atajoTeclado.html');

    atajoTecladoVentana.on('close', (evento) => {
        if (!app.isQuiting) {
            evento.preventDefault();
            atajoTecladoVentana.hide();
        }
        return false;
    });

    ventanaPrincipal.on('minimize', (evento) => {
        evento.preventDefault();
        atajoTecladoVentana.hide();
    });

    ventanaPrincipal.on('close', (evento) => {
        if (!app.isQuiting) {
            evento.preventDefault();
            atajoTecladoVentana.hide();
        }
    });

    const iconos = {
        darwin: 'images/16x16.png',
        linux: 'images/64x64.png',
        win32: 'images/64x64.png'
    };

    // Establecer icono de notificación dependiendo del sistema
    let areaBandeja = new Tray(path.join(__dirname, iconos[process.platform]));
    areaBandeja.setToolTip('Mostrar el historial del portapapeles');

    const plantillaOperaciones = [
        {
            label: 'Mostrar historial',
            click: () => ventanaPrincipal.show()
        },
        {
            label: 'Cambiar atajo de teclado',
            click: () => atajoTecladoVentana.show()
        },
        {
            type: 'separator'
        },
        {
            label: 'Salir',
            click: () => app.exit()
        }
    ];

    let menuContextual = Menu.buildFromTemplate(plantillaOperaciones);
    areaBandeja.setContextMenu(menuContextual);

    let atajoTecladoGlobal = await settings.get('globalShortcut');
    if (!atajoTecladoGlobal) {
        await settings.set('globalShortcut', 'CmdOrCtrl+Alt+Shift+Up');
        atajoTecladoGlobal = 'CmdOrCtrl+Alt+Shift+Up';
    }

    globalShorcut.register(atajoTecladoGlobal, () => {
        areaBandeja.focus();
        ventanaPrincipal.show();
    });
}

