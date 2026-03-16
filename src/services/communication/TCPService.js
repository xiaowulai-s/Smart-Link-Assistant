/**
 * TCP通信服务
 * 用于通过以太网连接设备
 */

class TCPService {
  constructor() {
    this.connections = new Map()
    this.listeners = new Map()
    this.isElectron = typeof window !== 'undefined' && window.electronAPI
  }

  /**
   * 建立TCP连接
   * @param {Object} config - 连接配置
   * @param {string} config.ip - IP地址
   * @param {number} config.port - 端口号
   * @param {string} config.deviceId - 设备ID
   * @returns {Promise<Object>} 连接结果
   */
  async connect(config) {
    try {
      if (this.isElectron) {
        // 使用 Electron IPC
        const result = await window.electronAPI.tcp.connect(config)

        if (result.success) {
          const connection = {
            id: result.connectionId,
            type: 'TCP',
            ip: config.ip,
            port: config.port,
            deviceId: config.deviceId,
            status: 'connected',
            connectedAt: result.deviceId ? new Date().toISOString() : undefined
          }
          this.connections.set(result.connectionId, connection)

          return {
            success: true,
            connection,
            message: result.message
          }
        } else {
          return {
            success: false,
            error: result.error,
            message: 'TCP连接失败'
          }
        }
      } else {
        // 开发模式 - 模拟连接
        console.log('TCP连接 (模拟):', config)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const connectionId = `${config.ip}:${config.port}`
        const connection = {
          id: connectionId,
          type: 'TCP',
          ip: config.ip,
          port: config.port,
          deviceId: config.deviceId,
          status: 'connected',
          connectedAt: new Date().toISOString()
        }
        this.connections.set(connectionId, connection)

        return {
          success: true,
          connection,
          message: 'TCP连接成功（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'TCP连接失败'
      }
    }
  }

  /**
   * 断开TCP连接
   * @param {string} connectionId - 连接ID
   * @returns {Promise<Object>} 断开结果
   */
  async disconnect(connectionId) {
    try {
      if (this.isElectron) {
        const result = await window.electronAPI.tcp.disconnect(connectionId)
        this.connections.delete(connectionId)
        return result
      } else {
        // 开发模式 - 模拟断开
        console.log('TCP断开连接 (模拟):', connectionId)
        this.connections.delete(connectionId)
        return {
          success: true,
          message: 'TCP连接已断开（模拟模式）'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '断开TCP连接失败'
      }
    }
  }

  /**
   * 发送命令
   * @param {string} connectionId - 连接ID
   * @param {string} command - 命令内容
   * @returns {Promise<Object>} 发送结果
   */
  async sendCommand(connectionId, command) {
    try {
      if (this.isElectron) {
        const result = await window.electronAPI.tcp.send(connectionId, command)
        return result
      } else {
        // 开发模式 - 模拟发送
        console.log('TCP发送命令 (模拟):', connectionId, command)
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
   * @param {string} connectionId - 连接ID
   * @param {Function} callback - 数据回调函数
   */
  onData(connectionId, callback) {
    if (this.isElectron) {
      // 设置监听器
      const listener = (event, data) => {
        if (data.connectionId === connectionId) {
          callback(data)
        }
      }
      window.electronAPI.tcp.onData(listener)
      this.listeners.set(`data:${connectionId}`, listener)

      // 同时监听错误和关闭事件
      window.electronAPI.tcp.onError((event, data) => {
        if (data.connectionId === connectionId) {
          callback({ ...data, type: 'error' })
        }
      })
      window.electronAPI.tcp.onClose((event, data) => {
        if (data.connectionId === connectionId) {
          callback({ ...data, type: 'close' })
        }
      })
    } else {
      // 开发模式 - 模拟数据接收
      console.log('TCP数据监听 (模拟):', connectionId)
    }
  }

  /**
   * 移除数据监听器
   * @param {string} connectionId - 连接ID
   */
  offData(connectionId) {
    if (this.isElectron && this.listeners.has(`data:${connectionId}`)) {
      const listener = this.listeners.get(`data:${connectionId}`)
      window.electronAPI.tcp.removeListener('tcp:data', listener)
      this.listeners.delete(`data:${connectionId}`)
    }
  }

  /**
   * 检查连接状态
   * @param {string} connectionId - 连接ID
   * @returns {boolean} 连接状态
   */
  async isConnected(connectionId) {
    if (this.isElectron) {
      return await window.electronAPI.tcp.isConnected(connectionId)
    }
    const connection = this.connections.get(connectionId)
    return connection && connection.status === 'connected'
  }

  /**
   * 获取所有连接
   * @returns {Array} 连接列表
   */
  async getConnections() {
    if (this.isElectron) {
      return await window.electronAPI.tcp.getConnections()
    }
    return Array.from(this.connections.values())
  }

  /**
   * 断开所有连接
   */
  async disconnectAll() {
    const connectionIds = Array.from(this.connections.keys())
    for (const id of connectionIds) {
      await this.disconnect(id)
    }
  }
}

// 导出单例
export default new TCPService()

