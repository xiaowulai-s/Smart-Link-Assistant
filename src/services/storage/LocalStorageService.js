/**
 * 本地存储服务 - 用于数据持久化
 */

const STORAGE_KEYS = {
  DEVICES: 'smartlink_devices',
  COMMAND_HISTORY: 'smartlink_command_history',
  CONNECTIONS: 'smartlink_connections',
  SETTINGS: 'smartlink_settings',
  ERROR_HISTORY: 'smartlink_errors',
}

class LocalStorageService {
  /**
   * 保存设备列表
   * @param {Array} devices - 设备列表
   */
  saveDevices(devices) {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices))
      return { success: true }
    } catch (error) {
      console.error('保存设备列表失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 加载设备列表
   * @returns {Array} 设备列表
   */
  loadDevices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEVICES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('加载设备列表失败:', error)
      return []
    }
  }

  /**
   * 保存命令历史
   * @param {Array} history - 命令历史
   */
  saveCommandHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMAND_HISTORY, JSON.stringify(history))
      return { success: true }
    } catch (error) {
      console.error('保存命令历史失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 加载命令历史
   * @returns {Array} 命令历史
   */
  loadCommandHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMAND_HISTORY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('加载命令历史失败:', error)
      return []
    }
  }

  /**
   * 保存连接配置
   * @param {Object} connections - 连接配置
   */
  saveConnections(connections) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(connections))
      return { success: true }
    } catch (error) {
      console.error('保存连接配置失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 加载连接配置
   * @returns {Object} 连接配置
   */
  loadConnections() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONNECTIONS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('加载连接配置失败:', error)
      return {}
    }
  }

  /**
   * 保存设置
   * @param {Object} settings - 设置
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
      return { success: true }
    } catch (error) {
      console.error('保存设置失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 加载设置
   * @returns {Object} 设置
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('加载设置失败:', error)
      return {}
    }
  }

  /**
   * 保存错误历史
   * @param {Array} errors - 错误列表
   */
  saveErrors(errors) {
    try {
      localStorage.setItem(STORAGE_KEYS.ERROR_HISTORY, JSON.stringify(errors))
      return { success: true }
    } catch (error) {
      console.error('保存错误历史失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 加载错误历史
   * @returns {Array} 错误列表
   */
  loadErrors() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ERROR_HISTORY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('加载错误历史失败:', error)
      return []
    }
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      return { success: true }
    } catch (error) {
      console.error('清空数据失败:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 清空指定键的数据
   * @param {string} key - 存储键
   */
  clearKey(key) {
    try {
      localStorage.removeItem(key)
      return { success: true }
    } catch (error) {
      console.error('清空数据失败:', error)
      return { success: false, error: error.message }
    }
  }
}

// 导出单例
export default new LocalStorageService()
