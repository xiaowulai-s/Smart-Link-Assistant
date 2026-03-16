/**
 * 通信服务统一入口
 */

import TCPService from './TCPService'
import SerialService from './SerialService'

class CommunicationService {
  /**
   * 发送命令到设备
   * @param {Object} device - 设备对象
   * @param {string} command - 命令内容
   * @returns {Promise<Object>} 发送结果
   */
  async sendCommand(device, command) {
    if (device.connectionType === 'TCP') {
      const connectionId = `${device.ip}:${device.port}`
      return TCPService.sendCommand(connectionId, command)
    } else if (device.connectionType === 'Serial') {
      return SerialService.sendCommand(device.serialPort, command)
    }
    throw new Error('不支持的连接类型')
  }

  /**
   * 连接设备
   * @param {Object} device - 设备对象
   * @returns {Promise<Object>} 连接结果
   */
  async connect(device) {
    if (device.connectionType === 'TCP') {
      return TCPService.connect({
        ip: device.ip,
        port: device.port,
        timeout: 5000
      })
    } else if (device.connectionType === 'Serial') {
      return SerialService.connect({
        path: device.serialPort,
        baudRate: device.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      })
    }
    throw new Error('不支持的连接类型')
  }

  /**
   * 断开设备连接
   * @param {Object} device - 设备对象
   * @returns {Promise<Object>} 断开结果
   */
  async disconnect(device) {
    if (device.connectionType === 'TCP') {
      const connectionId = `${device.ip}:${device.port}`
      return TCPService.disconnect(connectionId)
    } else if (device.connectionType === 'Serial') {
      return SerialService.disconnect(device.serialPort)
    }
    throw new Error('不支持的连接类型')
  }

  /**
   * 检查设备连接状态
   * @param {Object} device - 设备对象
   * @returns {boolean} 连接状态
   */
  isConnected(device) {
    if (device.connectionType === 'TCP') {
      const connectionId = `${device.ip}:${device.port}`
      return TCPService.isConnected(connectionId)
    } else if (device.connectionType === 'Serial') {
      return SerialService.isConnected(device.serialPort)
    }
    return false
  }

  /**
   * 获取可用的串口列表
   * @returns {Promise<Array>} 串口列表
   */
  async listSerialPorts() {
    return SerialService.listPorts()
  }

  /**
   * 断开所有连接
   */
  async disconnectAll() {
    await TCPService.disconnectAll()
    await SerialService.disconnectAll()
  }
}

// 导出单例
export default new CommunicationService()

// 同时导出各个独立服务
export { TCPService, SerialService }
