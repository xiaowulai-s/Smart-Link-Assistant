import React, { useState } from 'react'
import useStore from '../store/useStore'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import DeviceModal from '../components/modals/DeviceModal'

const DeviceManagement = () => {
  const { devices, selectedDevice, setSelectedDevice, removeDevice, updateDevice } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDevice, setEditingDevice] = useState(null)
  const [filter, setFilter] = useState('all')

  const filteredDevices = devices.filter(device => {
    if (filter === 'all') return true
    return device.status === filter
  })

  const handleAddDevice = () => {
    setEditingDevice(null)
    setModalOpen(true)
  }

  const handleEditDevice = (device) => {
    setEditingDevice(device)
    setModalOpen(true)
  }

  const handleDeleteDevice = (deviceId) => {
    if (window.confirm('确定要删除此设备吗？')) {
      removeDevice(deviceId)
    }
  }

  const handleSaveDevice = (deviceData) => {
    if (editingDevice) {
      updateDevice(editingDevice.id, deviceData)
    } else {
      useStore.getState().addDevice(deviceData)
    }
    setModalOpen(false)
  }

  const deviceTypes = [
    '气体分析仪',
    '气体检漏仪',
    '温湿度传感器',
    '压力传感器',
    '流量计',
    '其他'
  ]

  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-windows-text">设备管理</h2>
          <p className="text-windows-textSecondary mt-1">管理和配置所有监控设备</p>
        </div>
        <button
          onClick={handleAddDevice}
          className="flex items-center gap-2 px-4 py-2 bg-windows-primary text-white rounded-lg hover:bg-windows-primaryHover transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          添加设备
        </button>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-windows p-4">
        <div className="flex gap-2">
          {[
            { label: '全部', value: 'all' },
            { label: '已连接', value: 'connected' },
            { label: '未连接', value: 'disconnected' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === item.value
                  ? 'bg-windows-primary text-white'
                  : 'bg-gray-100 text-windows-text hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 设备列表 */}
      <div className="bg-white rounded-xl shadow-windows overflow-hidden">
        {filteredDevices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔌</div>
            <p className="text-windows-textSecondary">暂无设备</p>
            <button
              onClick={handleAddDevice}
              className="mt-4 text-windows-primary hover:text-windows-primaryHover font-medium"
            >
              添加第一个设备
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-windows-border">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-windows-text">设备名称</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-windows-text">设备类型</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-windows-text">设备ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-windows-text">状态</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-windows-text">连接类型</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-windows-text">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr
                  key={device.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {device.type.includes('气体') ? '🌡️' : '📡'}
                      </div>
                      <div>
                        <p className="font-medium text-windows-text">{device.name}</p>
                        <p className="text-sm text-windows-textSecondary">{device.description || '无描述'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-windows-text">{device.type}</td>
                  <td className="px-6 py-4 text-sm text-windows-textSecondary font-mono">{device.deviceId}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      device.status === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'}`} />
                      {device.status === 'connected' ? '已连接' : '未连接'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-windows-text">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      device.connectionType === 'TCP' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {device.connectionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditDevice(device)}
                        className="p-2 text-gray-500 hover:text-windows-primary hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 设备模态框 */}
      {modalOpen && (
        <DeviceModal
          device={editingDevice}
          deviceTypes={deviceTypes}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveDevice}
        />
      )}
    </div>
  )
}

export default DeviceManagement
