const {app,BrowserWindow,ipcMain,dialog,nativeImage,shell} = require("electron");

const fs = require('fs');
const path = require('path');

let win,type='dir',baseDir = '',savePath='',dataList=[];

function createWindow(){
	win = new BrowserWindow({
		width:1000,
        height:800,
		resizable:false,
		fullscreenable:false,
		// titleBarStyle:'hidden',
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
	// win.webContents.openDevTools();

}

ipcMain.on("chooseDir",function(event){
	const result = dialog.showOpenDialogSync(win,{properties:['openDirectory']});
	console.log(result);
	if(result){
		type = "dir";
		dataList = result;
	}
	event.returnValue = result;
})

ipcMain.on("compress",function (e) {
	if(type == "dir"){
		console.log(dataList)
		baseDir = dataList[0];
		savePath = path.resolve(baseDir,'../压缩图片_'+path.basename(baseDir));
		compressDir(fs.readdirSync(baseDir),baseDir);
	}else{
		dataList.forEach(file=>{
			compress(file);
		})
	}
	// console.log("complete")
	e.reply("complete");
})

ipcMain.on("showResult",function () {
	shell.openPath(savePath);
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

/**
 * 压缩图片
 * @param file 文件路径
 * @param cover 是否覆盖
 */
function compress(file,cover=false){
	const image = nativeImage.createFromPath(file);
	const imageData = image.toJPEG(50);

	if(cover){
		fs.writeFileSync(file,imageData);
		console.log('large');
		check(file);
	}else{
		const relativePath = path.relative(baseDir,file);
		const filePath = savePath+"/"+relativePath;
		const basePath = path.dirname(filePath);
		if(!fs.existsSync(basePath)){
			fs.mkdirSync(basePath,{recursive:true});
		}
		fs.writeFileSync(filePath,imageData);
		check(filePath);
	}


}

function compressDir(dirList,parent){
	dirList.forEach(file=>{
		const path = parent+"/"+file;
		if(file.indexOf('.')<0){
			compressDir(fs.readdirSync(path),path);
		}else{
			compress(path);
		}
	})
}

/**
 * 检查
 */
function check(file){
	const stat = fs.statSync(`${file}`);
	if(stat.size/1000/1000 >= 1){
		compress(file,true);
	}
}