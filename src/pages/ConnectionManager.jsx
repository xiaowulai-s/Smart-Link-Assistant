import React, { useState } from 'react'
import useStore from '../store/useStore'
import { PlayIcon, StopIcon, SignalIcon } from '@heroicons/react/24/outline'

const ConnectionManager = () => {
  const { devices, updateDevice } = useStore()
  const [connectingId, setConnectingId] = useState(null)

  const handleConnect = async (device) => {
    setConnectingId(device.id)
    try {
      // 这里将调用实际的连接逻辑
      await new Promise(resolve => setTimeout(resolve, 1500)) // 模拟连接延迟
      updateDevice(device.id, { status: 'connected' })
    } catch (error) {
      console.error('连接失败:', error)
    } finally {
      setConnectingId(null)
    }
  }

  const handleDisconnect = async (device) => {
    setConnectingId(device.id)
    try {
      // 这里将调用实际的断开连接逻辑
      await new Promise(resolve => setTimeout(resolve, 500)) // 模拟断开延迟
      updateDevice(device.id, { status: 'disconnected' })
    } catch (error) {
      console.error('断开连接失败:', error)
    } finally {
      setConnectingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-windows-text">连接管理</h2>
        <p className="text-windows-textSecondary mt-1">管理设备连接状态</p>
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
    </div>
  )
}

export default ConnectionManager
