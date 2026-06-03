// Electron main process — opens the smart mirror as a standalone, full-screen
// desktop window (like MagicMirror²), instead of a browser tab.
const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("node:path");

// In dev we load the Vite dev server; when packaged we load the built files.
const MIRROR_URL = process.env.MIRROR_URL || "http://localhost:3000";

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,
    frame: false,
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    win.loadURL(MIRROR_URL);
  }

  // Let the user leave the kiosk window: Esc or Cmd/Ctrl+Q quits.
  win.webContents.on("before-input-event", (_event, input) => {
    if (input.type !== "keyDown") return;
    const quit = input.key === "Escape" || ((input.meta || input.control) && input.key.toLowerCase() === "q");
    if (quit) app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("will-quit", () => globalShortcut.unregisterAll());

app.on("window-all-closed", () => {
  app.quit();
});
