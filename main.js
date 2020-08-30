const { app } = require('electron')
const { BrowserWindow } = require('electron')
const { globalShortcut } = require('electron')
const { dialog } = require('electron')
const { prompt } = require('electron-prompt')
const { autoUpdater } = require('electron-updater')
const { path } = require('path')
const server = 'https://update.electronjs.org'
const feed = `${server}/NeXiDE/NeXi-Client/${process.platform}-${process.arch}/${app.getVersion()}`

require('update-electron-app')(
{
	repo: 'https://github.com/NeXiDE/NeXi-Client',
	updateInterval: '9999999 Hour',
	logger: require('electron-log')
})


function init()
{
	createWindow();
	shortCuts();
	autoUpdate();
}

function autoUpdate()
{
	//Erstelle denn Logger
	autoUpdater.logger = require('electron-log')
	autoUpdater.logger.transports.file.level = 'info'

	//Erstelle denn Updater event
	autoUpdater.setFeedURL(feed)
	autoUpdater.on('checking-for-update', () => { console.log('Checking for updates...') })
	autoUpdater.on('update-available', (info) => { console.log('Update available'), console.log('Version', info.version), console.log('Release date', info.releaseDate) })
	autoUpdater.on('update-not-available', () => { console.log('Update not available'), Doneinit() })
	autoUpdater.on('download-progress', (progress) => { console.log('Progress ${Math.floor(progress.percent)}') })
	autoUpdater.on('update-downloaded', (info) => { console.log('Update downloaded'), autoUpdater.quitAndInstall() })
	autoUpdater.on('error', (error) => { console.error(error) })
}

//Erstellt das Fenster für Venge.io
function createWindow()
{
	//Funktioniert noch nicht. Muss mal ronics fragen
	/*app.commandLine.appendSwitch('disable-frame-rate-limit', true)*/

	win = new BrowserWindow({ width: 1920, height: 1080, icon: "imgs/game.png" })
	win.loadURL('https://venge.io')
	win.setFullScreen(true)
	win.removeMenu(true)
	win.setTitle('NeXi-Client')
	win.on('page-title-updated', function(e) { e.preventDefault() })
}

//Erstelle die Shortcuts
function shortCuts()
{
	globalShortcut.register('F1', () => { app.exit(0), app.relaunch(), console.log('Reload app') })
	globalShortcut.register('F2', () => { console.log('Linkbox has been opened'), LinkBox() })
	globalShortcut.register('F4', () => { app.exit(0), console.log('Quit has been used') }) //ALT+F4 funktioniert nicht
	globalShortcut.register('F5', () => { autoUpdate() })
	globalShortcut.register('F7', () => { ClearCache() })
	globalShortcut.register('F8', () => { FullClearCache() })
	globalShortcut.register('F9', () => { win.webContents.openDevTools(), console.log('DevTools opened') })
	globalShortcut.register('F10', () => { win.setFullScreen(false), console.log('Fullscreen disabled') })
	globalShortcut.register('F11', () => { win.setFullScreen(true), console.log('Fullscreen enabled') })
	globalShortcut.register('ESCAPE', () => { win.blur(), win.focus(), console.log('Lost Focus & Opened Menu') })
}

//Funktion damit die Linkbox erstellt wird
function LinkBox()
{
	prompt({
    title: 'Join via Link',
    label: 'Please enter your Lobby link:',
    value: 'https://venge.io/#00000',
    inputAttrs: {
        type: 'url'
    },
    type: 'input'
	})
	.then((r) => 
	{
		if(r === null) 
			{
				console.log('No lobby link given');
			} 
		else
		{
			console.log('LinkBox Input', r);
			win.loadURL(r);
		}
	})
	.catch(console.error);
}

//Kommt irgendwann wenn ich mal raffe wie man die '{ response: 0, checkboxChecked: false }' aufnimmt

/*function ClearCache()
{
        const response = dialog.showMessageBox({
            type: 'question',
            buttons: ['Ok'],
            title: 'Confirm',
            message: 'Your Cache has been cleard'
        })
		.then((response) =>
		{
			console.log(response)
			if(response === 0 )
			{
				console.log('User has selected', response)
				app.exit(0)
				app.relaunch()
			}
			else if(response === 1 )
			{
				console.log('User has selected', response)
				//Nothing
			}
			else
			{
				console.log('What is this: ', response)
			}
        })
}*/

//Cleared denn Cache vom Browser ohne viele Änderung (Soft Clear)
function ClearCache()
{
    const response = dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok'],
		title: 'Confirm',
		message: 'Your cache has been cleared. You may need to login in again. App will restart now'
    })

	.then((response) =>
	{
		console.log(response)
		if(response === 0 )
		{
			console.log('huh?')
			//huh?
		}
		else
		{
			const ses = win.webContents.session
			ses.clearCache()
			console.log('Cache has been cleared')
			//Starte die App neu nach dem Cache clear
			app.exit(0)
			app.relaunch()
		}
	})
}

//Cleared denn Cache vom Browser als hätte man denn Client zum ersten mal gestartet (Hard Clear)
function FullClearCache()
{
	console.log('Full Clear asked')
    const response = dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok'],
		title: 'Confirm',
		message: 'All your Game data will be lost with this button. If you dont wanted to press this button, please press F4. If you are sure you want to clear your data then press Ok'
    })

	.then((response) =>
	{
		console.log('Full clear confirmation')
		dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok'],
		title: 'Confirm',
		message: 'Are you really sure? All your Settings will reset to default again.'
		})
		.then((response) =>
		{
			console.log(response)
			if(response === 0 )
			{
				console.log('huh?')
				//huh?
			}
			else
			{
				const ses = win.webContents.session
				ses.clearStorageData()
				console.log('Full Cache has been cleared')
				//Starte die App neu nach dem Cache clear
				app.exit(0)
				app.relaunch()
			}
		})
	})
}

app.on('ready', init)