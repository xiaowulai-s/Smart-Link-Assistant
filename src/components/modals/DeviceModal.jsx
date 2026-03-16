import React, { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

const DeviceModal = ({ device, deviceTypes, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '气体分析仪',
    deviceId: '',
    connectionType: 'TCP',
    ip: '',
    port: '',
    serialPort: '',
    baudRate: 9600,
    description: '',
  })

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        type: device.type || '气体分析仪',
        deviceId: device.deviceId || '',
        connectionType: device.connectionType || 'TCP',
        ip: device.ip || '',
        port: device.port || '',
        serialPort: device.serialPort || '',
        baudRate: device.baudRate || 9600,
        description: device.description || '',
      })
    }
  }, [device])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      status: 'disconnected',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-windows-border">
          <h3 className="text-xl font-semibold text-windows-text">
            {device ? '编辑设备' : '添加新设备'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-windows-text mb-2">设备名称 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
              placeholder="输入设备名称"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-windows-text mb-2">设备类型 *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
            >
              {deviceTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-windows-text mb-2">设备ID *</label>
            <input
              type="text"
              required
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
              placeholder="输入设备唯一ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-windows-text mb-2">连接类型 *</label>
            <div className="grid grid-cols-2 gap-3">
              {['TCP', 'Serial'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, connectionType: type })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.connectionType === type
                      ? 'border-windows-primary bg-blue-50 text-windows-primary'
                      : 'border-gray-200 text-windows-text hover:border-gray-300'
                  }`}
                >
                  {type === 'TCP' ? '🌐 TCP网络' : '🔌 串口连接'}
                </button>
              ))}
            </div>
          </div>

          {formData.connectionType === 'TCP' ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-windows-text mb-2">IP地址</label>
                <input
                  type="text"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-windows-text mb-2">端口</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
                  placeholder="8080"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-windows-text mb-2">串口号</label>
                <input
                  type="text"
                  value={formData.serialPort}
                  onChange={(e) => setFormData({ ...formData, serialPort: e.target.value })}
                  className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
                  placeholder="COM1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-windows-text mb-2">波特率</label>
                <select
                  value={formData.baudRate}
                  onChange={(e) => setFormData({ ...formData, baudRate: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
                >
                  {[9600, 19200, 38400, 57600, 115200].map((rate) => (
                    <option key={rate} value={rate}>{rate}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-windows-text mb-2">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors resize-none"
              placeholder="输入设备描述信息（可选）"
            />
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-windows-border text-windows-text rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-windows-primary text-white rounded-lg hover:bg-windows-primaryHover transition-colors font-medium"
            >
              {device ? '保存修改' : '添加设备'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeviceModal
