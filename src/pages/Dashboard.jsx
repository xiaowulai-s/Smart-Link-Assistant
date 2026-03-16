import React, { useEffect, useState } from 'react'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'
import {
  DevicePhoneMobileIcon,
  ChartBarIcon,
  ServerIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { devices, realtimeData } = useStore()
  const [connectedCount, setConnectedCount] = useState(0)

  useEffect(() => {
    setConnectedCount(devices.filter(d => d.status === 'connected').length)
  }, [devices])

  const stats = [
    {
      name: '设备总数',
      value: devices.length,
      icon: DevicePhoneMobileIcon,
      color: 'bg-blue-500',
      path: '/devices'
    },
    {
      name: '在线设备',
      value: connectedCount,
      icon: ServerIcon,
      color: 'bg-green-500',
      path: '/connection'
    },
    {
      name: '数据点',
      value: Object.keys(realtimeData).length,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      path: '/monitoring'
    },
  ]

  const recentDevices = devices.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-windows-primary to-blue-600 rounded-2xl p-8 text-white shadow-windows-lg">
        <h2 className="text-3xl font-bold mb-2">欢迎使用 Smart Link Assistant</h2>
        <p className="text-blue-100 text-lg">工业设备智能监控与控制系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.path}
            className="bg-white rounded-xl p-6 shadow-windows hover:shadow-windows-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-windows-textSecondary mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-windows-text">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-xl shadow-windows p-6">
        <h3 className="text-lg font-semibold text-windows-text mb-4">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: '添加设备', path: '/devices', icon: '➕' },
            { name: '新建连接', path: '/connection', icon: '🔌' },
            { name: '查看数据', path: '/monitoring', icon: '📊' },
            { name: '发送指令', path: '/control', icon: '⚡' },
          ].map((action) => (
            <Link
              key={action.name}
              to={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-medium text-windows-text">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近设备 */}
      {recentDevices.length > 0 && (
        <div className="bg-white rounded-xl shadow-windows p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-windows-text">最近设备</h3>
            <Link
              to="/devices"
              className="text-windows-primary hover:text-windows-primaryHover text-sm font-medium flex items-center gap-1"
            >
              查看全部 <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-windows-text">{device.name}</p>
                    <p className="text-sm text-windows-textSecondary">{device.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  device.status === 'connected'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {device.status === 'connected' ? '已连接' : '未连接'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
