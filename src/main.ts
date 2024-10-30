import dotenv from 'dotenv';
import { BrowserWindow, app } from 'electron';
import fs from 'fs';
import path from 'path';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// eslint-disable-next-line @typescript-eslint/no-require-imports
if (require('electron-squirrel-startup')) {
    app.quit();
}

dotenv.config();

const createWindow = () => {
    const settings = readSettings();

    const defaultBounds = { width: 800, height: 600, x: 0, y: 0 };
    const bounds = settings?.bounds || defaultBounds;

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: bounds.width,
        height: bounds.height,
        x: bounds.x,
        y: bounds.y,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // and load the index.html of the app.
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
        mainWindow.loadFile(
            path.join(
                __dirname,
                `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
            ),
        );
    }

    // Open the DevTools.
    if (process.env.environment === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Remove the default menu bar
    mainWindow.setMenu(null);

    mainWindow.on('close', () => {
        const windowBounds = mainWindow.getBounds();
        const newSettings = { ...settings, bounds: windowBounds };
        writeSettings(newSettings);
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

interface Settings {
    firstLoad: boolean;
    bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

// Write the settings file
function writeSettings(settings: Settings) {
    try {
        const data = JSON.stringify(settings, null, 2);
        fs.writeFileSync(
            app.getPath('userData') + '/settings.json',
            data,
            'utf8',
        );
        console.log('Settings saved successfully.');
    } catch (err) {
        console.error('Failed to save settings:', err);
    }
}

// Read the settings file
function readSettings() {
    try {
        const data = fs.readFileSync(
            app.getPath('userData') + '/settings.json',
            'utf8',
        );
        return JSON.parse(data);
    } catch (err) {
        console.error('Failed to read settings:', err);
        return null;
    }
}
