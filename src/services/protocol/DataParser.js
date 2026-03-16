/**
 * 数据解析器
 * 用于解析从设备接收的数据流
 */

class DataParser {
  constructor() {
    // 数据缓冲区
    this.buffer = Buffer.alloc(0)

    // 支持的数据类型
    this.dataTypes = {
      TEMPERATURE: { code: 0x01, unit: '°C', name: '温度' },
      HUMIDITY: { code: 0x02, unit: '%', name: '湿度' },
      PRESSURE: { code: 0x03, unit: 'Pa', name: '压力' },
      GAS_CONCENTRATION: { code: 0x04, unit: 'ppm', name: '气体浓度' },
      FLOW_RATE: { code: 0x05, unit: 'L/min', name: '流量' },
      VOLTAGE: { code: 0x06, unit: 'V', name: '电压' },
      CURRENT: { code: 0x07, unit: 'A', name: '电流' },
      ERROR_CODE: { code: 0x80, unit: '', name: '错误码' },
    }

    // 错误码定义
    this.errorCodes = {
      0x00: '无错误',
      0x01: '传感器故障',
      0x02: '温度过高',
      0x03: '压力异常',
      0x04: '校准失败',
      0x05: '通信超时',
      0x06: '电源电压低',
      0x07: '气体泄漏检测',
      0xFF: '未知错误',
    }
  }

  /**
   * 添加数据到缓冲区
   * @param {string} data - 接收到的数据
   */
  addData(data) {
    // 如果是字符串，转换为 Buffer
    let newBuffer
    if (typeof data === 'string') {
      // 移除空格和换行符
      const cleanData = data.replace(/\s+/g, '')
      // 转换为 Buffer
      newBuffer = Buffer.from(cleanData, 'hex')
    } else if (Buffer.isBuffer(data)) {
      newBuffer = data
    } else {
      newBuffer = Buffer.from(String(data))
    }

    // 合并到缓冲区
    this.buffer = Buffer.concat([this.buffer, newBuffer])
  }

  /**
   * 清空缓冲区
   */
  clearBuffer() {
    this.buffer = Buffer.alloc(0)
  }

  /**
   * 解析完整的数据帧
   * @returns {Array} 解析后的数据帧数组
   */
  parseFrames() {
    const frames = []

    // 帧格式: [帧头: 0xAA][类型: 1字节][数据长度: 1字节][数据: N字节][校验和: 1字节][帧尾: 0x55]
    const HEADER = 0xAA
    const FOOTER = 0x55
    const MIN_FRAME_LENGTH = 5

    while (this.buffer.length >= MIN_FRAME_LENGTH) {
      // 查找帧头
      let startIndex = this.buffer.indexOf(HEADER)
      if (startIndex === -1) {
        // 没有找到帧头，清空缓冲区
        this.clearBuffer()
        break
      }

      // 跳过帧头之前的数据
      if (startIndex > 0) {
        this.buffer = this.buffer.slice(startIndex)
      }

      // 检查是否有足够的数据
      if (this.buffer.length < MIN_FRAME_LENGTH) {
        break
      }

      // 读取数据长度
      const dataLength = this.buffer[3]
      const totalFrameLength = 5 + dataLength

      // 检查帧是否完整
      if (this.buffer.length < totalFrameLength) {
        // 帧不完整，等待更多数据
        break
      }

      // 检查帧尾
      if (this.buffer[totalFrameLength - 1] !== FOOTER) {
        // 帧尾错误，跳过第一个字节
        this.buffer = this.buffer.slice(1)
        continue
      }

      // 验证校验和
      const checksum = this.calculateChecksum(this.buffer, 1, totalFrameLength - 2)
      if (checksum !== this.buffer[totalFrameLength - 2]) {
        // 校验和错误，跳过第一个字节
        this.buffer = this.buffer.slice(1)
        continue
      }

      // 提取数据帧
      const frameBuffer = this.buffer.slice(0, totalFrameLength)

      // 解析数据帧
      const frame = this.parseFrame(frameBuffer)
      if (frame) {
        frames.push(frame)
      }

      // 移除已处理的帧
      this.buffer = this.buffer.slice(totalFrameLength)
    }

    return frames
  }

  /**
   * 计算校验和
   * @param {Buffer} buffer - 数据缓冲区
   * @param {number} start - 起始索引
   * @param {number} end - 结束索引
   * @returns {number} 校验和
   */
  calculateChecksum(buffer, start, end) {
    let checksum = 0
    for (let i = start; i <= end; i++) {
      checksum ^= buffer[i]
    }
    return checksum
  }

  /**
   * 解析单个数据帧
   * @param {Buffer} frameBuffer - 帧缓冲区
   * @returns {Object|null} 解析后的数据帧
   */
  parseFrame(frameBuffer) {
    try {
      const typeCode = frameBuffer[1]
      const dataLength = frameBuffer[3]
      const data = frameBuffer.slice(4, 4 + dataLength)

      // 查找数据类型
      const dataType = Object.values(this.dataTypes).find(t => t.code === typeCode)
      const typeName = dataType ? dataType.name : '未知'

      // 解析数据值
      const parsedData = this.parseDataValue(typeCode, data)

      return {
        success: true,
        typeCode,
        typeName,
        unit: dataType ? dataType.unit : '',
        data,
        parsedData,
        timestamp: new Date().toISOString(),
        raw: frameBuffer.toString('hex')
      }
    } catch (error) {
      console.error('解析数据帧失败:', error)
      return null
    }
  }

  /**
   * 根据类型码解析数据值
   * @param {number} typeCode - 类型码
   * @param {Buffer} data - 数据
   * @returns {Object} 解析后的值
   */
  parseDataValue(typeCode, data) {
    // 温度数据（2字节：整数+小数）
    if (typeCode === 0x01 && data.length >= 2) {
      const integer = data[0]
      const decimal = data[1]
      const value = integer + decimal / 10
      return {
        value: value.toFixed(1),
        raw: value,
        format: 'decimal'
      }
    }

    // 湿度数据（1字节）
    if (typeCode === 0x02 && data.length >= 1) {
      return {
        value: data[0],
        raw: data[0],
        format: 'integer'
      }
    }

    // 压力数据（4字节）
    if (typeCode === 0x03 && data.length >= 4) {
      const value = data.readUInt32BE(0)
      return {
        value: value,
        raw: value,
        format: 'integer'
      }
    }

    // 气体浓度数据（2字节）
    if (typeCode === 0x04 && data.length >= 2) {
      const value = data.readUInt16BE(0)
      return {
        value: value,
        raw: value,
        format: 'integer'
      }
    }

    // 流量数据（4字节，浮点）
    if (typeCode === 0x05 && data.length >= 4) {
      const value = data.readFloatBE(0)
      return {
        value: value.toFixed(2),
        raw: value,
        format: 'float'
      }
    }

    // 电压数据（2字节）
    if (typeCode === 0x06 && data.length >= 2) {
      const value = data.readUInt16BE(0) / 1000 // 转换为伏特
      return {
        value: value.toFixed(3),
        raw: value,
        format: 'decimal'
      }
    }

    // 电流数据（2字节）
    if (typeCode === 0x07 && data.length >= 2) {
      const value = data.readUInt16BE(0) / 1000 // 转换为安培
      return {
        value: value.toFixed(3),
        raw: value,
        format: 'decimal'
      }
    }

    // 错误码（1字节）
    if (typeCode === 0x80 && data.length >= 1) {
      const errorCode = data[0]
      return {
        value: errorCode,
        description: this.errorCodes[errorCode] || '未知错误',
        format: 'error'
      }
    }

    // 默认返回原始数据
    return {
      value: null,
      raw: data,
      format: 'raw',
      hex: data.toString('hex')
    }
  }

  /**
   * 格式化数据为可读字符串
   * @param {Object} frame - 解析后的数据帧
   * @returns {string} 格式化字符串
   */
  formatFrame(frame) {
    if (!frame) {
      return '无效数据'
    }

    const { typeName, parsedData, unit, timestamp } = frame
    const time = new Date(timestamp).toLocaleTimeString('zh-CN')

    if (parsedData) {
      return `[${time}] ${typeName}: ${parsedData.value} ${unit}`
    }

    return `[${time}] ${typeName}: ${frame.raw}`
  }

  /**
   * 获取数据统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      bufferSize: this.buffer.length,
      bufferHex: this.buffer.toString('hex').substring(0, 100) + '...'
    }
  }
}

// 导出单例
export default new DataParser()
