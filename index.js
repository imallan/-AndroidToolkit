const { app, BrowserWindow, ipcMain } = require('electron')
var adbHandler

var mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    height: 640,
    width: 360
  })

  mainWindow.on("window-all-closed", () => {
    app.quit()
  })

  if (process.env.ENVIRONMENT === 'DEV') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadURL('file://' + __dirname + '/index.html')
})

ipcMain.on('adb', (event, arg) => {
  adbHandler = require('./adb.js')
  adbHandler(event, arg)
})
