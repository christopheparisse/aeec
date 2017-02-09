/**
 * @module init.js
 * initial file for the main process of electron
 */

'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const Menu = electron.Menu;
const help = require('./dist/aeec/help.js');
const msg = require('./dist/aeec/messgs.js');
//console.log('language:', localStorage.AEEC_lg);
msg.set('fra');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let isReady = false;

function createWindow() {
    var displays = electron.screen.getAllDisplays();
    // console.log(displays);
    var width = displays[0].workArea.width * 0.80;
    var height = displays[0].workArea.height * 0.90;
    if (width > 500) width = 650; else width = Math.trunc(width);
    // console.log(width, height);
    // Create the browser window.
    mainWindow = new BrowserWindow({width: width, height: Math.trunc(height)});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    });
}

function createMenu() {
    var template = [
    {
        label: msg.m.corpus,
        submenu: [
        { label: msg.m.new, accelerator: 'CmdOrCtrl+N', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('new', 'main');
        } },
        { label: msg.m.open, accelerator: 'CmdOrCtrl+O', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('open', 'main');
        } },
        { label: msg.m.save, accelerator: 'CmdOrCtrl+S', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('save', 'main');
        } },
        { label: msg.m.saveas, accelerator: 'Shift+CmdOrCtrl+S', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('saveas', 'main');
        } },
        { label: msg.m.preferences, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('preferences', 'main');
        } },
        ]
    },
    {
        label: msg.m.edit,
        submenu: [
        { label: msg.m.insertfile, accelerator: 'CmdOrCtrl+I', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('insertfile', 'main');
        } },
        { label: msg.m.insertdir, accelerator: 'Shift+CmdOrCtrl+I', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('insertdir', 'main');
        } },
        { label: msg.m.insertdirselect, accelerator: 'Alt+CmdOrCtrl+I', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('insertdirselect', 'main');
        } },
        { label: msg.m.removefile, accelerator: 'CmdOrCtrl+D', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('removeline', 'main');
        } },
        { type: 'separator' },
        { label: 'Multiple Select', accelerator: 'CmdOrCtrl+E', click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('multipleselect', 'main');
        } },
        { type: 'separator' },
        { label: msg.m.update, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('update', 'main');
        } },
        { label: msg.m.setMaster, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmaster', 'main');
        } },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
        ]
    },
    {
        label: msg.m.process,
        submenu: [
        { label: msg.m.opentrjs, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('starttrjs', 'main');
        } },
        { label: msg.m.openelan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('startelan', 'main');
        } },
        { label: msg.m.openclan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('startclan', 'main');
        } },
        { label: msg.m.openpraat, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('startpraat', 'main');
        } },
        { label: msg.m.opentranscriber, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('starttranscriber', 'main');
        } },
        { type: 'separator' },
        { label: msg.m.converttei, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('converttei', 'main');
        } },
        { label: msg.m.convertelan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('convertelan', 'main');
        } },
        { label: msg.m.convertclan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('convertclan', 'main');
        } },
        { label: msg.m.convertpraat, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('convertpraat', 'main');
        } },
        { label: msg.m.converttranscriber, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('converttranscriber', 'main');
        } },
        { type: 'separator' },
        { label: msg.m.setmastertei, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmastertei', 'main');
        } },
        { label: msg.m.setmasterelan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmasterelan', 'main');
        } },
        { label: msg.m.setmasterclan, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmasterclan', 'main');
        } },
        { label: msg.m.setmasterpraat, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmasterpraat', 'main');
        } },
        { label: msg.m.setmastertranscriber, click: function () {
            let window    = BrowserWindow.getFocusedWindow();
            window.webContents.send('setmastertranscriber', 'main');
        } },
        ]
    },
    {
        label: 'View',
        submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: function(item, focusedWindow) {
            if (focusedWindow) focusedWindow.reload();
          }},
        { label: 'Toggle Full Screen', accelerator: (function() {
            if (process.platform == 'darwin')
                return 'Ctrl+Command+F';
            else
                return 'F11';
            })(),
            click: function(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
            }
        },
        { label: 'Toggle Developer Tools', accelerator: (function() {
            if (process.platform == 'darwin')
                return 'Alt+Command+I';
            else
                return 'Ctrl+Shift+I';
            })(),
            click: function(item, focusedWindow) {
            if (focusedWindow)
                focusedWindow.toggleDevTools();
            }
        },
        ]
    },
    {
        label: 'Window',
        role: 'window',
        submenu: [
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        ]
    },
    { label: 'Help', role: 'help', submenu: [
        { label: 'Short help',
          click: function() {
              help.shortHelp();
              // require('electron').shell.openExternal('http://electron.atom.io');
          }
        },
        ]
    },
    ];

    if (process.platform === 'darwin') {
        var name = require('electron').app.getName();
        template.unshift(
            { label: name,
            submenu: [
                { label: 'About ' + name,
                    click: function() {
                        help.shortHelp();
                    }
                },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: 'Hide ' + name, accelerator: 'Command+H', role: 'hide' },
                { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: function() { app.quit(); } }
            ]
        });
        // Window menu.
        template[4].submenu.push( { type: 'separator' } );
        template[4].submenu.push( { label: 'Bring All to Front', role: 'front' } );
    }
    var localmenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(localmenu);
}

//var process = require(process);
//console.log(process.argv);

var shouldQuit = app.makeSingleInstance(function(commandLine, workingDirectory) {
    // Someone tried to run a second instance, we should focus our window.
    if (process.mainWindow) {
        if (process.mainWindow.isMinimized()) process.mainWindow.restore();
        process.mainWindow.focus();
        if (commandLine.length>1 && commandLine[1] !== 'index.js') {
            process.mainWindow.webContents.send('readtranscript', commandLine[1]);
        } else if (commandLine.length>2) {
            process.mainWindow.webContents.send('readtranscript', commandLine[2]);
        }
    }
});

if (shouldQuit) {
    app.quit();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
    isReady = true;
    createWindow();
    createMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (process.mainWindow === null && isReady === true) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
