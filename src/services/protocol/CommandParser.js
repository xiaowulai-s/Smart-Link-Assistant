/**
 * 命令解析器
 * 用于解析和构建设备指令帧
 */

class CommandParser {
  constructor() {
    // 支持的命令类型定义
    this.commandTypes = {
      // 基础命令
      READ_DATA: { code: 0x01, name: '读取数据' },
      START_MEASURE: { code: 0x02, name: '开始测量' },
      STOP_MEASURE: { code: 0x03, name: '停止测量' },
      RESET: { code: 0x04, name: '复位' },

      // 校准命令
      CALIBRATE: { code: 0x10, name: '校准' },
      SET_ZERO: { code: 0x11, name: '归零' },
      CALIBRATION_STATUS: { code: 0x12, name: '校准状态' },

      // 配置命令
      GET_CONFIG: { code: 0x20, name: '获取配置' },
      SET_CONFIG: { code: 0x21, name: '设置配置' },
      SAVE_CONFIG: { code: 0x22, name: '保存配置' },

      // 状态命令
      GET_STATUS: { code: 0x30, name: '获取状态' },
      GET_VERSION: { code: 0x31, name: '获取版本' },
      GET_SERIAL: { code: 0x32, name: '获取序列号' },
    }

    // 响应码定义
    this.responseCodes = {
      0x00: { name: '成功', description: '命令执行成功' },
      0x01: { name: '失败', description: '命令执行失败' },
      0x02: { name: '校验错误', description: '数据校验失败' },
      0x03: { name: '不支持', description: '不支持该命令' },
      0x04: { name: '参数错误', description: '参数不正确' },
      0x05: { name: '忙', description: '设备忙，稍后重试' },
    }

    // 帧头和帧尾
    this.frameHeader = 0xAA
    this.frameFooter = 0x55
  }

  /**
   * 构建命令帧
   * @param {string} commandName - 命令名称
   * @param {Array} params - 参数数组（可选）
   * @returns {string} 十六进制字符串
   */
  buildCommand(commandName, params = []) {
    const command = this.commandTypes[commandName]
    if (!command) {
      throw new Error(`未知的命令: ${commandName}`)
    }

    // 构建帧结构
    // 帧头(1) + 设备ID(1) + 命令码(1) + 数据长度(1) + 数据(N) + 校验和(1) + 帧尾(1)
    let frame = []

    // 帧头
    frame.push(this.frameHeader)

    // 设备ID（默认 0x01）
    frame.push(0x01)

    // 命令码
    frame.push(command.code)

    // 数据长度
    const dataLength = params.length
    frame.push(dataLength)

    // 数据
    frame.push(...params)

    // 校验和（异或校验）
    let checksum = 0
    for (let i = 1; i < frame.length; i++) {
      checksum ^= frame[i]
    }
    frame.push(checksum)

    // 帧尾
    frame.push(this.frameFooter)

    // 转换为十六进制字符串
    return frame.map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ')
  }

  /**
   * 解析响应帧
   * @param {string} hexData - 十六进制字符串
   * @returns {Object} 解析结果
   */
  parseResponse(hexData) {
    try {
      // 移除空格，转换为字节数组
      const bytes = hexData.replace(/\s+/g, '').match(/.{1,2}/g)
        .map(hex => parseInt(hex, 16))

      // 验证帧头和帧尾
      if (bytes[0] !== this.frameHeader) {
        throw new Error('无效的帧头')
      }
      if (bytes[bytes.length - 1] !== this.frameFooter) {
        throw new Error('无效的帧尾')
      }

      // 解析帧结构
      const deviceId = bytes[1]
      const responseCode = bytes[2]
      const dataLength = bytes[3]
      const data = bytes.slice(4, 4 + dataLength)
      const checksum = bytes[bytes.length - 2]

      // 验证校验和
      let calculatedChecksum = 0
      for (let i = 1; i < bytes.length - 2; i++) {
        calculatedChecksum ^= bytes[i]
      }
      if (calculatedChecksum !== checksum) {
        throw new Error('校验和错误')
      }

      // 查找响应码描述
      const responseInfo = this.responseCodes[responseCode] || {
        name: '未知',
        description: '未知响应码'
      }

      // 解析数据（根据命令类型）
      const parsedData = this.parseData(responseCode, data)

      return {
        success: true,
        deviceId,
        responseCode,
        responseName: responseInfo.name,
        responseDescription: responseInfo.description,
        data,
        parsedData,
        raw: hexData
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        raw: hexData
      }
    }
  }

  /**
   * 根据响应码解析数据
   * @param {number} responseCode - 响应码
   * @param {Array} data - 数据数组
   * @returns {Object} 解析后的数据
   */
  parseData(responseCode, data) {
    // 数据解析示例
    if (data.length === 0) {
      return null
    }

    // 示例：温度数据（2字节，整数+小数）
    if (data.length === 2) {
      const integer = data[0]
      const decimal = data[1]
      const value = integer + decimal / 10
      return {
        type: 'single_value',
        value: value.toFixed(1),
        unit: '°C'
      }
    }

    // 示例：气体浓度数据（4字节：浓度、温度、湿度、压力）
    if (data.length === 4) {
      return {
        type: 'gas_measurement',
        concentration: data[0],
        temperature: data[1] + data[2] / 10,
        humidity: data[3],
        pressure: data[4]
      }
    }

    // 示例：设备状态数据
    if (data.length === 3) {
      return {
        type: 'status',
        isMeasuring: !!(data[0] & 0x01),
        isCalibrated: !!(data[0] & 0x02),
        hasError: !!(data[0] & 0x80),
        errorCode: data[1],
        battery: data[2]
      }
    }

    // 默认返回原始数据
    return {
      type: 'raw',
      bytes: data,
      hex: data.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ')
    }
  }

  /**
   * 格式化命令为可读字符串
   * @param {string} command - 命令名称
   * @returns {Object} 格式化信息
   */
  formatCommand(command) {
    const info = this.commandTypes[command]
    if (!info) {
      return null
    }

    return {
      name: command,
      code: info.code.toString(16).padStart(2, '0').toUpperCase(),
      description: info.name,
      hexCode: `0x${info.code.toString(16).padStart(2, '0').toUpperCase()}`
    }
  }

  /**
   * 获取所有支持的命令
   * @returns {Array} 命令列表
   */
  getAvailableCommands() {
    return Object.keys(this.commandTypes).map(key => ({
      name: key,
      ...this.commandTypes[key]
    }))
  }
}

// 导出单例
export default new CommandParser()
