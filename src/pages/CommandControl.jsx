import React, { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import CommunicationService from '../services/communication'
import { PaperAirplaneIcon, ClockIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const CommandControl = () => {
  const { devices, commandHistory, addCommandHistory, addDevice } = useStore()
  const [selectedDeviceId, setSelectedDeviceId] = useState(null)
  const [commandType, setCommandType] = useState('custom')
  const [customCommand, setCustomCommand] = useState('')
  const [selectedCommand, setSelectedCommand] = useState('')
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [showResult, setShowResult] = useState(false)

  const connectedDevices = devices.filter(d => d.status === 'connected')

  // 获取可用的命令列表
  const availableCommands = CommunicationService.getAvailableCommands()

  // 预定义命令模板（如果没有可用的协议命令，使用默认模板）
  const commandTemplates = availableCommands.length > 0
    ? availableCommands.map(cmd => ({
        id: cmd,
        name: cmd,
        command: cmd
      }))
    : [
        { id: 'read_data', name: '读取数据', command: 'READ_DATA' },
        { id: 'start_measure', name: '开始测量', command: 'START_MEASURE' },
        { id: 'stop_measure', name: '停止测量', command: 'STOP_MEASURE' },
        { id: 'calibrate', name: '校准', command: 'CALIBRATE' },
        { id: 'reset', name: '复位', command: 'RESET' },
        { id: 'get_status', name: '获取状态', command: 'GET_STATUS' },
        { id: 'set_zero', name: '归零', command: 'SET_ZERO' },
        { id: 'get_config', name: '获取配置', command: 'GET_CONFIG' },
      ]

  const selectedDevice = selectedDeviceId
    ? connectedDevices.find(d => d.id === selectedDeviceId)
    : connectedDevices[0]

  const handleSendCommand = async () => {
    if (!selectedDevice) return

    const command = commandType === 'custom' ? customCommand : selectedCommand
    if (!command) return

    setSending(true)
    setShowResult(false)
    try {
      const result = await CommunicationService.sendCommand(selectedDevice, command)

      // 设置结果
      setLastResult(result)
      setShowResult(true)

      if (result.success) {
        // 记录命令历史
        addCommandHistory({
          deviceId: selectedDevice.id,
          deviceName: selectedDevice.name,
          command: command,
          type: commandType,
        })

        // 清空自定义命令
        if (commandType === 'custom') {
          setCustomCommand('')
        }
      } else {
        console.error('发送命令失败:', result.error)
        alert(`发送命令失败: ${result.error || result.message}`)
      }
    } catch (error) {
      console.error('发送命令失败:', error)
      setLastResult({
        success: false,
        error: error.message,
        message: '发送命令失败'
      })
      setShowResult(true)
    } finally {
      setSending(false)
    }
  }

  // 3秒后自动隐藏结果提示
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setShowResult(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showResult])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-windows-text">指令控制</h2>
        <p className="text-windows-textSecondary mt-1">向设备发送控制指令</p>
      </div>

      {/* 结果提示 */}
      {showResult && lastResult && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
          lastResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {lastResult.success ? (
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-medium">
            {lastResult.success ? '命令发送成功' : (lastResult.error || lastResult.message)}
          </span>
        </div>
      )}

      {connectedDevices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-windows p-12 text-center">
          <div className="text-6xl mb-4">⚡</div>
          <p className="text-windows-textSecondary">暂无连接的设备</p>
          <p className="text-sm text-windows-textSecondary mt-1">请先在连接管理中连接设备</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：设备选择和命令发送 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 设备选择 */}
            <div className="bg-white rounded-xl shadow-windows p-6">
              <h3 className="font-semibold text-windows-text mb-4">选择设备</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedDevices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDeviceId(device.id)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedDeviceId === device.id
                        ? 'border-windows-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      device.type.includes('气体') ? 'bg-orange-100' : 'bg-blue-100'
                    }`}>
                      {device.type.includes('气体') ? '🌡️' : '📡'}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-windows-text">{device.name}</p>
                      <p className="text-xs text-windows-textSecondary">{device.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 命令发送 */}
            <div className="bg-white rounded-xl shadow-windows p-6">
              <h3 className="font-semibold text-windows-text mb-4">发送命令</h3>

              {/* 命令类型选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-windows-text mb-2">命令类型</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCommandType('template')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      commandType === 'template'
                        ? 'border-windows-primary bg-blue-50 text-windows-primary'
                        : 'border-gray-200 text-windows-text hover:border-gray-300'
                    }`}
                  >
                    📋 预设模板
                  </button>
                  <button
                    onClick={() => setCommandType('custom')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      commandType === 'custom'
                        ? 'border-windows-primary bg-blue-50 text-windows-primary'
                        : 'border-gray-200 text-windows-text hover:border-gray-300'
                    }`}
                  >
                    ✏️ 自定义命令
                  </button>
                </div>
              </div>

              {commandType === 'template' ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-windows-text mb-2">选择命令</label>
                  <select
                    value={selectedCommand}
                    onChange={(e) => setSelectedCommand(e.target.value)}
                    className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors"
                  >
                    <option value="">请选择命令...</option>
                    {commandTemplates.map((template) => (
                      <option key={template.id} value={template.command}>
                        {template.name} ({template.command})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-windows-text mb-2">输入命令</label>
                  <textarea
                    value={customCommand}
                    onChange={(e) => setCustomCommand(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-windows-border rounded-lg focus:outline-none focus:ring-2 focus:ring-windows-primary/50 focus:border-windows-primary transition-colors font-mono text-sm"
                    placeholder="输入自定义命令指令帧..."
                  />
                </div>
              )}

              {/* 命令预览 */}
              {(commandType === 'template' && selectedCommand) ||
                (commandType === 'custom' && customCommand) ? (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-windows-textSecondary mb-1">命令预览</p>
                  <p className="font-mono text-sm text-windows-text">
                    {commandType === 'template' ? selectedCommand : customCommand}
                  </p>
                </div>
              ) : null}

              {/* 发送按钮 */}
              <button
                onClick={handleSendCommand}
                disabled={!selectedDevice || sending ||
                  (commandType === 'template' ? !selectedCommand : !customCommand)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-windows-primary text-white rounded-lg hover:bg-windows-primaryHover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    发送中...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    发送命令
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 右侧：命令历史 */}
          <div className="bg-white rounded-xl shadow-windows overflow-hidden">
            <div className="px-4 py-3 border-b border-windows-border bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-windows-text">命令历史</h3>
              <ClockIcon className="w-5 h-5 text-windows-textSecondary" />
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {commandHistory.length === 0 ? (
                <div className="p-8 text-center text-windows-textSecondary">
                  <p>暂无命令记录</p>
                </div>
              ) : (
                commandHistory.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-windows-text">{item.deviceName}</p>
                      <span className="text-xs text-windows-textSecondary">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-windows-textSecondary bg-gray-100 p-2 rounded">
                      {item.command}
                    </p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                      item.type === 'template' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {item.type === 'template' ? '模板' : '自定义'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommandControl
