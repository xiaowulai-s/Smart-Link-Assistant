const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 串口 API
  serial: {
    listPorts: () => ipcRenderer.invoke('serial:listPorts'),
    connect: (config) => ipcRenderer.invoke('serial:connect', config),
    disconnect: (portPath) => ipcRenderer.invoke('serial:disconnect', portPath),
    send: (portPath, data) => ipcRenderer.invoke('serial:send', portPath, data),
    isConnected: (portPath) => ipcRenderer.invoke('serial:isConnected', portPath),
    getConnections: () => ipcRenderer.invoke('serial:getConnections'),
    onData: (callback) => ipcRenderer.on('serial:data', callback),
    onError: (callback) => ipcRenderer.on('serial:error', callback),
    onClose: (callback) => ipcRenderer.on('serial:close', callback),
  },

  // TCP API
  tcp: {
    connect: (config) => ipcRenderer.invoke('tcp:connect', config),
    disconnect: (connectionId) => ipcRenderer.invoke('tcp:disconnect', connectionId),
    send: (connectionId, data) => ipcRenderer.invoke('tcp:send', connectionId, data),
    isConnected: (connectionId) => ipcRenderer.invoke('tcp:isConnected', connectionId),
    getConnections: () => ipcRenderer.invoke('tcp:getConnections'),
    onData: (callback) => ipcRenderer.on('tcp:data', callback),
    onError: (callback) => ipcRenderer.on('tcp:error', callback),
    onClose: (callback) => ipcRenderer.on('tcp:close', callback),
    onTimeout: (callback) => ipcRenderer.on('tcp:timeout', callback),
  },
})
