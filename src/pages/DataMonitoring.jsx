import React, { useState } from 'react'
import useStore from '../store/useStore'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const DataMonitoring = () => {
  const { devices, realtimeData } = useStore()
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const connectedDevices = devices.filter(d => d.status === 'connected')

  const selectedDevice = selectedDeviceId
    ? connectedDevices.find(d => d.id === selectedDeviceId)
    : connectedDevices[0]

  const deviceData = selectedDevice ? realtimeData[selectedDevice.id] : null

  // 模拟实时数据
  const mockData = {
    temperature: { value: 25.3, unit: '°C', label: '温度' },
    humidity: { value: 65.2, unit: '%', label: '湿度' },
    pressure: { value: 101325, unit: 'Pa', label: '压力' },
    gas: { value: 0.5, unit: 'ppm', label: '气体浓度' },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-windows-text">数据监控</h2>
          <p className="text-windows-textSecondary mt-1">实时查看设备数据</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-windows-text">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-windows-primary focus:ring-windows-primary"
            />
            自动刷新
          </label>
          <button className="p-2 text-windows-text hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {connectedDevices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-windows p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-windows-textSecondary">暂无连接的设备</p>
          <p className="text-sm text-windows-textSecondary mt-1">请先在连接管理中连接设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 设备选择面板 */}
          <div className="bg-white rounded-xl shadow-windows overflow-hidden">
            <div className="px-4 py-3 border-b border-windows-border bg-gray-50">
              <h3 className="font-semibold text-windows-text">设备列表</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {connectedDevices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setSelectedDeviceId(device.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedDeviceId === device.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-windows-text truncate">{device.name}</p>
                      <p className="text-xs text-windows-textSecondary">{device.type}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 数据显示面板 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDevice && (
              <>
                {/* 设备信息 */}
                <div className="bg-white rounded-xl shadow-windows p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-windows-text">{selectedDevice.name}</h3>
                      <p className="text-sm text-windows-textSecondary">{selectedDevice.type}</p>
                    </div>
                    <span className="flex items-center gap-2 text-sm text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      实时
                    </span>
                  </div>

                  {/* 数据卡片 */}
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(mockData).map(([key, data]) => (
                      <div
                        key={key}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <p className="text-sm text-windows-textSecondary mb-1">{data.label}</p>
                        <p className="text-2xl font-bold text-windows-text">
                          {data.value} <span className="text-lg font-normal text-windows-textSecondary">{data.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 数据趋势图表（模拟） */}
                <div className="bg-white rounded-xl shadow-windows p-6">
                  <h3 className="font-semibold text-windows-text mb-4">数据趋势</h3>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-windows-textSecondary">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>图表组件将在此显示</p>
                      <p className="text-sm">（可集成 ECharts、Recharts 等）</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!selectedDevice && (
              <div className="bg-white rounded-xl shadow-windows p-12 text-center">
                <div className="text-6xl mb-4">👆</div>
                <p className="text-windows-textSecondary">请选择一个设备查看数据</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DataMonitoring
