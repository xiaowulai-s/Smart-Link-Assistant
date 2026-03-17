const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const net = require('net')

// 设置中文语言
app.commandLine.appendSwitch('lang', 'zh-CN')

// 串口连接管理器
class SerialPortManager {
  constructor() {
    this.connections = new Map() // 存储所有串口连接 {portPath: {port, parser, deviceId}}
  }

  // 列出所有可用串口
  async listPorts() {
    try {
      const ports = await SerialPort.list()
      return {
        success: true,
        ports: ports.map(p => ({
          path: p.path,
          manufacturer: p.manufacturer,
          serialNumber: p.serialNumber,
          productId: p.productId,
          vendorId: p.vendorId
        }))
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 连接串口
  async connect(config) {
    try {
      const { portPath, baudRate, dataBits, stopBits, parity, deviceId } = config

      // 检查是否已连接
      if (this.connections.has(portPath)) {
        return {
          success: false,
          error: '该串口已连接'
        }
      }

      // 创建串口连接
      const port = new SerialPort({
        path: portPath,
        baudRate: baudRate || 9600,
        dataBits: dataBits || 8,
        stopBits: stopBits || 1,
        parity: parity || 'none',
        autoOpen: false
      })

      // 创建行解析器
      const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

      // 打开连接
      await new Promise((resolve, reject) => {
        port.open((err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      // 存储连接
      this.connections.set(portPath, {
        port,
        parser,
        deviceId,
        connectedAt: new Date().toISOString()
      })

      // 监听数据
      this.setupDataListener(portPath)

      return {
        success: true,
        message: `串口 ${portPath} 连接成功`,
        portPath,
        deviceId
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 断开串口连接
  async disconnect(portPath) {
    try {
      const connection = this.connections.get(portPath)
      if (!connection) {
        return {
          success: false,
          error: '该串口未连接'
        }
      }

      // 关闭连接
      if (connection.port.isOpen) {
        await new Promise((resolve) => {
          connection.port.close(resolve)
        })
      }

      // 移除连接
      this.connections.delete(portPath)

      return {
        success: true,
        message: `串口 ${portPath} 已断开`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 发送数据到串口
  async sendData(portPath, data) {
    try {
      const connection = this.connections.get(portPath)
      if (!connection) {
        return {
          success: false,
          error: '该串口未连接'
        }
      }

      // 转换数据格式
      const buffer = Buffer.from(data, 'utf8')

      // 发送数据
      connection.port.write(buffer, (err) => {
        if (err) throw err
      })

      return {
        success: true,
        message: '数据发送成功',
        data: data.toString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 设置数据监听器
  setupDataListener(portPath) {
    const connection = this.connections.get(portPath)
    if (!connection) return

    connection.parser.on('data', (data) => {
      // 将数据发送到渲染进程
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:data', {
          portPath,
          deviceId: connection.deviceId,
          data: data.toString(),
          timestamp: new Date().toISOString()
        })
      }
    })

    connection.port.on('error', (err) => {
      console.error('串口错误:', err)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:error', {
          portPath,
          error: err.message
        })
      }
    })

    connection.port.on('close', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:close', {
          portPath,
          deviceId: connection.deviceId
        })
      }
    })
  }

  // 检查连接状态
  isConnected(portPath) {
    const connection = this.connections.get(portPath)
    return connection && connection.port.isOpen
  }

  // 获取所有连接
  getConnections() {
    const connections = []
    for (const [portPath, connection] of this.connections.entries()) {
      connections.push({
        portPath,
        deviceId: connection.deviceId,
        connectedAt: connection.connectedAt,
        isOpen: connection.port.isOpen
      })
    }
    return connections
  }

  // 断开所有连接
  async disconnectAll() {
    const portPaths = Array.from(this.connections.keys())
    for (const portPath of portPaths) {
      await this.disconnect(portPath)
    }
  }
}

// TCP 连接管理器
class TCPConnectionManager {
  constructor() {
    this.connections = new Map() // {connectionId: {socket, deviceId}}
  }

  // 连接 TCP
  async connect(config) {
    try {
      const { ip, port, deviceId } = config
      const connectionId = `${ip}:${port}`

      // 检查是否已连接
      if (this.connections.has(connectionId)) {
        return {
          success: false,
          error: '该连接已存在'
        }
      }

      // 创建 TCP 连接
      const socket = new net.Socket()

      // 建立连接
      await new Promise((resolve, reject) => {
        socket.connect(port, ip, () => {
          resolve()
        })

        socket.on('error', reject)
      })

      // 移除错误监听器
      socket.removeAllListeners('error')

      // 存储连接
      this.connections.set(connectionId, {
        socket,
        deviceId,
        ip,
        port,
        connectedAt: new Date().toISOString()
      })

      // 设置数据监听
      this.setupDataListener(connectionId)

      return {
        success: true,
        message: `TCP 连接成功: ${ip}:${port}`,
        connectionId,
        deviceId
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 断开 TCP 连接
  async disconnect(connectionId) {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) {
        return {
          success: false,
          error: '该连接不存在'
        }
      }

      // 关闭连接
      connection.socket.destroy()

      // 移除连接
      this.connections.delete(connectionId)

      return {
        success: true,
        message: `TCP 连接已断开: ${connectionId}`
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 发送数据到 TCP
  async sendData(connectionId, data) {
    try {
      const connection = this.connections.get(connectionId)
      if (!connection) {
        return {
          success: false,
          error: '该连接不存在'
        }
      }

      // 发送数据
      connection.socket.write(Buffer.from(data, 'utf8'))

      return {
        success: true,
        message: '数据发送成功',
        data: data.toString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 设置数据监听器
  setupDataListener(connectionId) {
    const connection = this.connections.get(connectionId)
    if (!connection) return

    connection.socket.on('data', (data) => {
      // 将数据发送到渲染进程
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tcp:data', {
          connectionId,
          deviceId: connection.deviceId,
          data: data.toString(),
          timestamp: new Date().toISOString()
        })
      }
    })

    connection.socket.on('error', (err) => {
      console.error('TCP 错误:', err)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tcp:error', {
          connectionId,
          error: err.message
        })
      }
    })

    connection.socket.on('close', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tcp:close', {
          connectionId,
          deviceId: connection.deviceId
        })
      }
    })

    connection.socket.on('timeout', () => {
      console.warn('TCP 超时:', connectionId)
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('tcp:timeout', {
          connectionId
        })
      }
    })
  }

  // 检查连接状态
  isConnected(connectionId) {
    const connection = this.connections.get(connectionId)
    return connection && !connection.socket.destroyed
  }

  // 获取所有连接
  getConnections() {
    const connections = []
    for (const [connectionId, connection] of this.connections.entries()) {
      connections.push({
        connectionId,
        deviceId: connection.deviceId,
        ip: connection.ip,
        port: connection.port,
        connectedAt: connection.connectedAt,
        isDestroyed: connection.socket.destroyed
      })
    }
    return connections
  }

  // 断开所有连接
  async disconnectAll() {
    const connectionIds = Array.from(this.connections.keys())
    for (const connectionId of connectionIds) {
      await this.disconnect(connectionId)
    }
  }
}

// 创建管理器实例
const serialManager = new SerialPortManager()
const tcpManager = new TCPConnectionManager()

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#f3f3f3'
  })

  // 开发环境加载本地服务器，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 在应用启动时设置语言
app.on('ready', () => {
  app.setAppUserModelId('com.smartlink.assistant')
})

app.whenReady().then(() => {
  // 设置应用语言
  app.setLocale('zh-CN')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 在应用启动时设置语言
app.on('ready', () => {
  app.setAppUserModelId('com.smartlink.assistant')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 断开所有连接
    serialManager.disconnectAll()
    tcpManager.disconnectAll()
    app.quit()
  }
})

// ==================== IPC 处理器 ====================

// 串口相关 IPC
ipcMain.handle('serial:listPorts', async () => {
  return await serialManager.listPorts()
})

ipcMain.handle('serial:connect', async (event, config) => {
  return await serialManager.connect(config)
})

ipcMain.handle('serial:disconnect', async (event, portPath) => {
  return await serialManager.disconnect(portPath)
})

ipcMain.handle('serial:send', async (event, portPath, data) => {
  return await serialManager.sendData(portPath, data)
})

ipcMain.handle('serial:isConnected', async (event, portPath) => {
  return serialManager.isConnected(portPath)
})

ipcMain.handle('serial:getConnections', async () => {
  return serialManager.getConnections()
})

// TCP 相关 IPC
ipcMain.handle('tcp:connect', async (event, config) => {
  return await tcpManager.connect(config)
})

ipcMain.handle('tcp:disconnect', async (event, connectionId) => {
  return await tcpManager.disconnect(connectionId)
})

ipcMain.handle('tcp:send', async (event, connectionId, data) => {
  return await tcpManager.sendData(connectionId, data)
})

ipcMain.handle('tcp:isConnected', async (event, connectionId) => {
  return tcpManager.isConnected(connectionId)
})

ipcMain.handle('tcp:getConnections', async () => {
  return tcpManager.getConnections()
})
