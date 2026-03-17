import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import CommunicationService from '../services/communication'
import { PlayIcon, StopIcon, SignalIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useToast, Alert } from '../components/common/Toast'

const ConnectionManager = () => {
  const { devices, updateDevice, errors, addError, removeError } = useStore()
  const { success: showSuccess, error: showError } = useToast()
  const [connectingId, setConnectingId] = useState(null)
  const [serialPorts, setSerialPorts] = useState([])
  const [loadingPorts, setLoadingPorts] = useState(false)

  // 加载串口列表
  const loadSerialPorts = async () => {
    setLoadingPorts(true)
    try {
      const result = await CommunicationService.listSerialPorts()
      if (result.success) {
        setSerialPorts(result.ports)
      }
    } catch (error) {
      console.error('加载串口列表失败:', error)
    } finally {
      setLoadingPorts(false)
    }
  }

  // 初始加载串口列表
  useEffect(() => {
    loadSerialPorts()
  }, [])

  const handleConnect = async (device) => {
    setConnectingId(device.id)
    try {
      const result = await CommunicationService.connect(device, (data) => {
        // 处理接收到的数据
        console.log('接收到数据:', data)
      })

      if (result.success) {
        updateDevice(device.id, { status: 'connected' })
        showSuccess(`设备 ${device.name} 连接成功`)
      } else {
        const errorMsg = result.error || result.message || '连接失败'
        addError({
          deviceId: device.id,
          deviceName: device.name,
          type: 'connection',
          message: errorMsg,
        })
        showError(`设备 ${device.name} 连接失败: ${errorMsg}`)
      }
    } catch (err) {
      console.error('连接失败:', err)
      const errorMsg = err.message || '连接失败'
      addError({
        deviceId: device.id,
        deviceName: device.name,
        type: 'connection',
        message: errorMsg,
      })
      showError(`设备 ${device.name} 连接失败: ${errorMsg}`)
    } finally {
      setConnectingId(null)
    }
  }

  const handleDisconnect = async (device) => {
    setConnectingId(device.id)
    try {
      const result = await CommunicationService.disconnect(device)

      if (result.success) {
        updateDevice(device.id, { status: 'disconnected' })
        showSuccess(`设备 ${device.name} 已断开连接`)
      } else {
        const errorMsg = result.error || result.message || '断开连接失败'
        addError({
          deviceId: device.id,
          deviceName: device.name,
          type: 'disconnection',
          message: errorMsg,
        })
        showError(`设备 ${device.name} 断开连接失败: ${errorMsg}`)
      }
    } catch (err) {
      console.error('断开连接失败:', err)
      const errorMsg = err.message || '断开连接失败'
      addError({
        deviceId: device.id,
        deviceName: device.name,
        type: 'disconnection',
        message: errorMsg,
      })
      showError(`设备 ${device.name} 断开连接失败: ${errorMsg}`)
    } finally {
      setConnectingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-windows-text">连接管理</h2>
          <p className="text-windows-textSecondary mt-1">管理设备连接状态</p>
        </div>
        {devices.some(d => d.connectionType === 'Serial') && (
          <button
            onClick={loadSerialPorts}
            disabled={loadingPorts}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-windows-border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loadingPorts ? 'animate-spin' : ''}`} />
            刷新串口
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white rounded-xl shadow-windows p-6 hover:shadow-windows-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  device.type.includes('气体') ? 'bg-orange-100' : 'bg-blue-100'
                }`}>
                  {device.type.includes('气体') ? '🌡️' : '📡'}
                </div>
                <div>
                  <h3 className="font-semibold text-windows-text">{device.name}</h3>
                  <p className="text-sm text-windows-textSecondary">{device.type}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                device.status === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`} />
                {device.status === 'connected' ? '已连接' : '未连接'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-windows-textSecondary">连接类型:</span>
                <span className="font-medium text-windows-text">{device.connectionType}</span>
              </div>
              {device.connectionType === 'TCP' ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-windows-textSecondary">IP地址:</span>
                    <span className="font-medium text-windows-text">{device.ip || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-windows-textSecondary">端口:</span>
                    <span className="font-medium text-windows-text">{device.port || '-'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-windows-textSecondary">串口:</span>
                    <span className="font-medium text-windows-text">{device.serialPort || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-windows-textSecondary">波特率:</span>
                    <span className="font-medium text-windows-text">{device.baudRate || '-'}</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => {
                if (device.status === 'connected') {
                  handleDisconnect(device)
                } else {
                  handleConnect(device)
                }
              }}
              disabled={connectingId === device.id}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                device.status === 'connected'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-windows-primary text-white hover:bg-windows-primaryHover'
              } ${connectingId === device.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {connectingId === device.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  连接中...
                </>
              ) : device.status === 'connected' ? (
                <>
                  <StopIcon className="w-4 h-4" />
                  断开连接
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  连接设备
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="bg-white rounded-xl shadow-windows p-12 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <p className="text-windows-textSecondary">暂无设备</p>
          <p className="text-sm text-windows-textSecondary mt-1">请先在设备管理中添加设备</p>
        </div>
      )}

      {/* 错误列表 */}
      {errors.length > 0 && (
        <div className="bg-white rounded-xl shadow-windows p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-windows-text">最近错误</h3>
            <button
              onClick={() => useStore.getState().clearErrors()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              清空
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {errors.slice(0, 10).map((err) => (
              <div key={err.id} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{err.deviceName || '未知设备'}</p>
                  <p className="text-xs text-red-600 mt-1">{err.message}</p>
                  <p className="text-xs text-red-500 mt-1">
                    {new Date(err.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeError(err.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionManager
