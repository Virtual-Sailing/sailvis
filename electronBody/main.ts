import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: true
    },
    icon: path.join(__dirname, "..", 'render/favicon.ico')
  });
  mainWindow.maximize();
  let param = "";
  if (process.argv.length == 2) {
    // argument passed. Check if and sanitize if potential filename
    param = process.argv[process.argv.length-1].trim();
    if (param.endsWith(".sbp")) {
      try {
        const stat = await fs.promises.stat(param);
        if (!stat.isFile()) {
          param = "";
        }
      } catch (e) {
        param = "";
      }
    } else { param = ""; }
  }
  console.log(param);
  // Load the local URL for development or the local
  // html file for production
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", 'render/index.html'));
  }
  ipcMain.handle("getFileData", () => {
    if (param != "") { return fs.promises.readFile(param); }
    else { return ""; }
  });
  ipcMain.handle("getFileName", () => {
    if (param != "") { return path.basename(param); }
    else { return ""; }
  });
}

app.whenReady().then(() => {
  createWindow();
});

// not sure if need this:
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });