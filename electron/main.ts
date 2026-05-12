import { app, BrowserWindow, Menu, ipcMain, shell } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import path from 'node:path';
import { cancelSynthesis, synthesizeViaProxy } from './ttsProxy';
import type { DesktopSynthesizeRequest } from '../src/types/electron';

const rendererUrl = process.env.ELECTRON_RENDERER_URL;
const isDev = Boolean(rendererUrl);

let mainWindow: BrowserWindow | null = null;

function getDevRendererEntryUrl(): string {
  if (!rendererUrl) {
    throw new Error('缺少 ELECTRON_RENDERER_URL');
  }
  const baseUrl = rendererUrl.endsWith('/') ? rendererUrl : `${rendererUrl}/`;
  return new URL('index.electron.html#/', baseUrl).toString();
}

function isAllowedNavigation(url: string): boolean {
  if (isDev && rendererUrl && url.startsWith(rendererUrl)) return true;
  return url.startsWith('file://');
}

function createApplicationMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        {
          label: '关闭窗口',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          role: 'quit',
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'Shift+CmdOrCtrl+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'Alt+CmdOrCtrl+I', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '缩放', role: 'zoom' },
        { type: 'separator' },
        { label: '置于最前', role: 'front' },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '项目主页',
          click: () => {
            void shell.openExternal('https://github.com/Silence-dream/MiMo-TTS-Studio');
          },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: 'MiMo 语音合成工作室',
      submenu: [
        { label: '关于 MiMo 语音合成工作室', role: 'about' },
        { type: 'separator' },
        { label: '服务', role: 'services' },
        { type: 'separator' },
        { label: '隐藏 MiMo 语音合成工作室', accelerator: 'Cmd+H', role: 'hide' },
        { label: '隐藏其他应用', accelerator: 'Alt+Cmd+H', role: 'hideOthers' },
        { label: '显示全部', role: 'unhide' },
        { type: 'separator' },
        { label: '退出', accelerator: 'Cmd+Q', role: 'quit' },
      ],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 820,
    minWidth: 900,
    minHeight: 680,
    title: 'MiMo 语音合成工作室',
    backgroundColor: '#1a1a1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isAllowedNavigation(url)) return;
    event.preventDefault();
    void shell.openExternal(url);
  });

  if (isDev && rendererUrl) {
    void mainWindow.loadURL(getDevRendererEntryUrl());
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist-electron-renderer/index.electron.html'));
  }
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(() => {
    createApplicationMenu();

    ipcMain.handle('mimo:tts:synthesize', (_event, request: DesktopSynthesizeRequest) =>
      synthesizeViaProxy(request)
    );
    ipcMain.handle('mimo:tts:cancel', (_event, requestId: string) => {
      cancelSynthesis(requestId);
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
