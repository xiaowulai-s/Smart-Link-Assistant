/**
 * 通信服务统一入口
 */

import TCPService from './TCPService'
import SerialService from './SerialService'
import CommandParser from '../protocol/CommandParser'
import DataParser from '../protocol/DataParser'

class CommunicationService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI
  }

  /**
   * 发送命令到设备
   * @param {Object} device - 设备对象
   * @param {string} commandName - 命令名称或自定义命令
   * @param {Array} params - 参数数组（可选）
   * @returns {Promise<Object>} 发送结果
   */
  async sendCommand(device, commandName, params = []) {
    try {
      // 构建命令帧
      let commandFrame
      if (CommandParser.commandTypes[commandName]) {
        // 预定义命令
        commandFrame = CommandParser.buildCommand(commandName, params)
      } else {
        // 自定义命令（直接使用）
        commandFrame = commandName
      }

      console.log(`发送命令到设备 ${device.name}:`, commandFrame)

      // 根据连接类型发送
      if (device.connectionType === 'TCP') {
        const connectionId = `${device.ip}:${device.port}`
        return await TCPService.sendCommand(connectionId, commandFrame)
      } else if (device.connectionType === 'Serial') {
        return await SerialService.sendCommand(device.serialPort, commandFrame)
      }

      throw new Error('不支持的连接类型')
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '发送命令失败'
      }
    }
  }

  /**
   * 连接设备
   * @param {Object} device - 设备对象
   * @param {Function} onData - 数据接收回调
   * @returns {Promise<Object>} 连接结果
   */
  async connect(device, onData = null) {
    try {
      let result

      if (device.connectionType === 'TCP') {
        result = await TCPService.connect({
          ip: device.ip,
          port: device.port,
          timeout: 5000,
          deviceId: device.deviceId
        })

        if (result.success && onData) {
          const connectionId = `${device.ip}:${device.port}`
          this._setupDataListener('TCP', connectionId, onData)
        }
      } else if (device.connectionType === 'Serial') {
        result = await SerialService.connect({
          portPath: device.serialPort,
          baudRate: device.baudRate,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          deviceId: device.deviceId
        })

        if (result.success && onData) {
          this._setupDataListener('Serial', device.serialPort, onData)
        }
      } else {
        throw new Error('不支持的连接类型')
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '连接设备失败'
      }
    }
  }

  /**
   * 设置数据监听器
   * @param {string} type - 连接类型 ('TCP' | 'Serial')
   * @param {string} connectionId - 连接ID
   * @param {Function} callback - 回调函数
   */
  _setupDataListener(type, connectionId, callback) {
    const parser = DataParser

    const dataCallback = (data) => {
      // 添加数据到解析器缓冲区
      parser.addData(data.data || data)

      // 解析完整的数据帧
      const frames = parser.parseFrames()

      // 回调每一帧数据
      frames.forEach(frame => {
        callback({
          ...frame,
          connectionType: type,
          connectionId,
        })
      })
    }

    if (type === 'TCP') {
      TCPService.onData(connectionId, dataCallback)
    } else {
      SerialService.onData(connectionId, dataCallback)
    }
  }

  /**
   * 断开设备连接
   * @param {Object} device - 设备对象
   * @returns {Promise<Object>} 断开结果
   */
  async disconnect(device) {
    try {
      if (device.connectionType === 'TCP') {
        const connectionId = `${device.ip}:${device.port}`
        TCPService.offData(connectionId)
        return await TCPService.disconnect(connectionId)
      } else if (device.connectionType === 'Serial') {
        SerialService.offData(device.serialPort)
        return await SerialService.disconnect(device.serialPort)
      }

      throw new Error('不支持的连接类型')
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: '断开设备失败'
      }
    }
  }

  /**
   * 检查设备连接状态
   * @param {Object} device - 设备对象
   * @returns {boolean} 连接状态
   */
  async isConnected(device) {
    if (device.connectionType === 'TCP') {
      const connectionId = `${device.ip}:${device.port}`
      return await TCPService.isConnected(connectionId)
    } else if (device.connectionType === 'Serial') {
      return await SerialService.isConnected(device.serialPort)
    }
    return false
  }

  /**
   * 获取可用的串口列表
   * @returns {Promise<Array>} 串口列表
   */
  async listSerialPorts() {
    return await SerialService.listPorts()
  }

  /**
   * 获取所有连接状态
   * @returns {Promise<Object>} 连接状态
   */
  async getAllConnections() {
    const tcpConnections = await TCPService.getConnections()
    const serialConnections = await SerialService.getConnections()

    return {
      tcp: tcpConnections,
      serial: serialConnections,
      total: tcpConnections.length + serialConnections.length
    }
  }

  /**
   * 断开所有连接
   */
  async disconnectAll() {
    await TCPService.disconnectAll()
    await SerialService.disconnectAll()
  }

  /**
   * 获取支持的命令列表
   * @returns {Array} 命令列表
   */
  getAvailableCommands() {
    return CommandParser.getAvailableCommands()
  }

  /**
   * 格式化命令
   * @param {string} commandName - 命令名称
   * @returns {Object} 格式化后的命令
   */
  formatCommand(commandName) {
    return CommandParser.formatCommand(commandName)
  }

  /**
   * 解析响应数据
   * @param {string} hexData - 十六进制数据
   * @returns {Object} 解析结果
   */
  parseResponse(hexData) {
    return CommandParser.parseResponse(hexData)
  }

  /**
   * 检查是否运行在 Electron 环境
   * @returns {boolean}
   */
  isElectronEnv() {
    return this.isElectron
  }
}

// 导出单例
export default new CommunicationService()

// 同时导出各个独立服务和解析器
export { TCPService, SerialService, CommandParser, DataParser }
