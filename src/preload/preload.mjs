import { contextBridge, ipcRenderer } from 'electron';

const converterAPI = {
  selectFiles: () => ipcRenderer.invoke('dialog:selectFiles'),
  selectOutputDir: () => ipcRenderer.invoke('dialog:selectOutputDir'),
  start: (data) => ipcRenderer.invoke('converter:start', data),
  cancel: () => ipcRenderer.invoke('converter:cancel'),
  retry: (jobIds) => ipcRenderer.invoke('converter:retry', { jobIds }),
  openOutputFolder: (path) => ipcRenderer.invoke('converter:openOutputFolder', { path }),
  openFile: (path) => ipcRenderer.invoke('converter:openFile', { path }),
  getVersion: () => ipcRenderer.invoke('converter:getVersion'),

  onJobStarted: (callback) => {
    ipcRenderer.on('conversion:started', (_, job) => callback(job));
  },
  onJobCompleted: (callback) => {
    ipcRenderer.on('conversion:completed', (_, job) => callback(job));
  },
  onJobFailed: (callback) => {
    ipcRenderer.on('conversion:failed', (_, job) => callback(job));
  },
  onJobProgress: (callback) => {
    ipcRenderer.on('conversion:progress', (_, job) => callback(job));
  },
  onQueueCompleted: (callback) => {
    ipcRenderer.on('queue:completed', (_, summary) => callback(summary));
  },

  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('conversion:started');
    ipcRenderer.removeAllListeners('conversion:completed');
    ipcRenderer.removeAllListeners('conversion:failed');
    ipcRenderer.removeAllListeners('conversion:progress');
    ipcRenderer.removeAllListeners('queue:completed');
  }
};

const windowAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized')
};

const settingsAPI = {
  get: () => ipcRenderer.invoke('settings:get'),
  set: (key, value) => ipcRenderer.invoke('settings:set', { key, value })
};

contextBridge.exposeInMainWorld('converter', converterAPI);
contextBridge.exposeInMainWorld('windowControls', windowAPI);
contextBridge.exposeInMainWorld('settings', settingsAPI);
