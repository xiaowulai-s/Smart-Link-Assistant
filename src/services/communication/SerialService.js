/**
 * 串口通信服务
 * 用于通过USB/串口连接设备
 */

class SerialService {
  constructor() {
    this.connections = new Map()
    this.listeners = new Map()
    this.isElectron = typeof window !== 'undefined' && window.electronAPI
  }

  /**
   * 列出可用的串口
   * @returns {Promise<Array>} 串口列表
   */
  async listPorts() {
    try {
      if (this.isElectron) {
        // 使用 Electron IPC
        const result = await window.electronAPI.serial.listPorts()
        return result
      } else {
        // 开发模式 - 模拟串口列表
        console.log('获取串口列表 (模拟)...')
        const ports = [
          { path: 'COM1', manufacturer: 'FTDI', serialNumber: 'FT123456', productId: '0x6001' },
          { path: 'COM3', manufacturer: 'Silicon Labs', serialNumber: 'SI789012', productId: '0xEA60' },
          { path: 'COM4', manufacturer: 'Prolific', serialNumber: 'PL345678', productId: '0x2303' },
        ]

        return {
          success: true,
          ports,
          message: '获取串口列表成功（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '获取串口列表失败'
      }
    }
  }

  /**
   * 建立串口连接
   * @param {Object} config - 连接配置
   * @param {string} config.portPath - 串口路径 (如 COM1, /dev/ttyUSB0)
   * @param {number} config.baudRate - 波特率
   * @param {number} config.dataBits - 数据位 (默认8)
   * @param {number} config.stopBits - 停止位 (默认1)
   * @param {string} config.parity - 校验位 (默认'none')
   * @param {string} config.deviceId - 设备ID
   * @returns {Promise<Object>} 连接结果
   */
  async connect(config) {
    try {
      if (this.isElectron) {
        // 使用 Electron IPC
        const result = await window.electronAPI.serial.connect(config)

        if (result.success) {
          const connection = {
            id: result.portPath,
            type: 'Serial',
            portPath: result.portPath,
            baudRate: config.baudRate,
            dataBits: config.dataBits || 8,
            stopBits: config.stopBits || 1,
            parity: config.parity || 'none',
            deviceId: config.deviceId,
            status: 'connected',
            connectedAt: new Date().toISOString()
          }
          this.connections.set(result.portPath, connection)

          return {
            success: true,
            connection,
            message: result.message
          }
        } else {
          return {
            success: false,
            error: result.error,
            message: '串口连接失败'
          }
        }
      } else {
        // 开发模式 - 模拟连接
        console.log('串口连接 (模拟):', config)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const connection = {
          id: config.portPath,
          type: 'Serial',
          portPath: config.portPath,
          baudRate: config.baudRate,
          dataBits: config.dataBits || 8,
          stopBits: config.stopBits || 1,
          parity: config.parity || 'none',
          deviceId: config.deviceId,
          status: 'connected',
          connectedAt: new Date().toISOString()
        }
        this.connections.set(config.portPath, connection)

        return {
          success: true,
          connection,
          message: '串口连接成功（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '串口连接失败'
      }
    }
  }

  /**
   * 断开串口连接
   * @param {string} portPath - 串口路径
   * @returns {Promise<Object>} 断开结果
   */
  async disconnect(portPath) {
    try {
      if (this.isElectron) {
        const result = await window.electronAPI.serial.disconnect(portPath)
        this.connections.delete(portPath)
        return result
      } else {
        // 开发模式 - 模拟断开
        console.log('串口断开连接 (模拟):', portPath)
        this.connections.delete(portPath)
        return {
          success: true,
          message: '串口连接已断开（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '断开串口连接失败'
      }
    }
  }

  /**
   * 发送命令
   * @param {string} portPath - 串口路径
   * @param {string|Buffer} command - 命令内容
   * @returns {Promise<Object>} 发送结果
   */
  async sendCommand(portPath, command) {
    try {
      if (this.isElectron) {
        const result = await window.electronAPI.serial.send(portPath, command)
        return result
      } else {
        // 开发模式 - 模拟发送
        console.log('串口发送命令 (模拟):', portPath, command)
        await new Promise(resolve => setTimeout(resolve, 500))

        return {
          success: true,
          sentAt: new Date().toISOString(),
          command,
          response: 'ACK',
          message: '命令发送成功（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '命令发送失败'
      }
    }
  }

  /**
   * 接收数据
   * @param {string} portPath - 串口路径
   * @param {Function} callback - 数据回调函数
   */
  onData(portPath, callback) {
    if (this.isElectron) {
      // 设置监听器
      const listener = (event, data) => {
        if (data.portPath === portPath) {
          callback(data)
        }
      }
      window.electronAPI.serial.onData(listener)
      this.listeners.set(`data:${portPath}`, listener)

      // 同时监听错误和关闭事件
      window.electronAPI.serial.onError((event, data) => {
        if (data.portPath === portPath) {
          callback({ ...data, type: 'error' })
        }
      })
      window.electronAPI.serial.onClose((event, data) => {
        if (data.portPath === portPath) {
          callback({ ...data, type: 'close' })
        }
      })
    } else {
      // 开发模式 - 模拟数据接收
      console.log('串口数据监听 (模拟):', portPath)
    }
  }

  /**
   * 移除数据监听器
   * @param {string} portPath - 串口路径
   */
  offData(portPath) {
    if (this.isElectron && this.listeners.has(`data:${portPath}`)) {
      const listener = this.listeners.get(`data:${portPath}`)
      window.electronAPI.serial.removeListener('serial:data', listener)
      this.listeners.delete(`data:${portPath}`)
    }
  }

  /**
   * 检查连接状态
   * @param {string} portPath - 串口路径
   * @returns {boolean} 连接状态
   */
  async isConnected(portPath) {
    if (this.isElectron) {
      return await window.electronAPI.serial.isConnected(portPath)
    }
    const connection = this.connections.get(portPath)
    return connection && connection.status === 'connected'
  }

  /**
   * 获取所有连接
   * @returns {Array} 连接列表
   */
  async getConnections() {
    if (this.isElectron) {
      return await window.electronAPI.serial.getConnections()
    }
    return Array.from(this.connections.values())
  }

  /**
   * 断开所有连接
   */
  async disconnectAll() {
    const portPaths = Array.from(this.connections.keys())
    for (const portPath of portPaths) {
      await this.disconnect(portPath)
    }
  }
}

// 导出单例
export default new SerialService()

