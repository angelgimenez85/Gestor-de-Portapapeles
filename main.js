const { 
    app,
    BrowserWindow, 
    globalShortcut, 
    ipcMain, 
    Menu, 
    Tray 
} = require('electron');
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
        icon: __dirname + '/images/16x16.png',
        webPreferences: {
            preload: path.join(__dirname, 'js', 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    ventanaPrincipal.setMenuBarVisibility(true);
    ventanaPrincipal.loadFile('index.html');

    const ventanaAtajoTeclado = new BrowserWindow({
        width: 400,
        height: 650,
        frame: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        show: false,
        title: 'Atajo de teclado',
        icon: __dirname + '/images/16x16.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    ventanaAtajoTeclado.setMenuBarVisibility(false);
    ventanaAtajoTeclado.loadFile('atajoTeclado.html');

    ventanaAtajoTeclado.on('close', (e) => {
        if (!app.isQuiting) {
            e.preventDefault();
            ventanaAtajoTeclado.hide();
        }
        return false;
    });

    ventanaPrincipal.on('minimize', (e) => {
        e.preventDefault();
        ventanaPrincipal.hide();
    });

    ventanaPrincipal.on('close', (e) => {
        if (!app.isQuiting) {
            e.preventDefault();
            ventanaPrincipal.hide();
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
            click: () => ventanaAtajoTeclado.show()
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

    let atajoTecladoGlobal = await settings.get('atajoTecladoGlobal');

    if (!atajoTecladoGlobal) {
        await settings.set('atajoTecladoGlobal', 'CmdOrCtrl+Alt+Shift+Up');
        atajoTecladoGlobal = 'CmdOrCtrl+Alt+Shift+Up';
    }

    globalShortcut.register(atajoTecladoGlobal, () => {
        areaBandeja.focus();
        ventanaPrincipal.show();
    });

}

app.whenReady().then(iniciarAplicacion);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }    
});

app.on('active', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        iniciarAplicacion();
    }
});

ipcMain.on('finalizar-aplicacion', () => {
    app.exit();
});

app.on('quit', () => {
    //globalShortcut.unregister('CmdOrCtrl+Alt+Shift+Up');
    //globalShortcut.unregisterAll();
});