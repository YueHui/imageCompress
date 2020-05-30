const {app,BrowserWindow,ipcMain,net,globalShortcut} = require("electron");

let win;

function createWindow(){
	win = new BrowserWindow({
		width:800,
        height:600,
        title:"图片压缩",
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
    });
	win.on('closed', () => {
		win = null
    })
    win.loadFile('./src/index.html');

    // win.on('focus', () => {
    //     globalShortcut.register('CommandOrControl+F', function () {
    //         if (win && win.webContents) {
    //             win.webContents.send('on-find', '')
    //         }
    //     })
    // })
    // win.on('blur', () => {
    //     globalShortcut.unregister('CommandOrControl+F')
    // })

}

ipcMain.on("showConsole",function(){
	if(win !== null){
		win.webContents.openDevTools();
	}
})

app.on('ready', createWindow);

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
	// 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
	// 否则绝大部分应用及其菜单栏会保持激活。
	if (process.platform !== 'darwin') {
		app.quit();
	}
})

app.on('activate', () => {
	// 在macOS上，当单击dock图标并且没有其他窗口打开时，
	// 通常在应用程序中重新创建一个窗口。
	if (win === null) {
		createWindow()
	}
})