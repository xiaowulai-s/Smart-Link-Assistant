import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  DevicePhoneMobileIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CommandLineIcon,
  ServerIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  const navigation = [
    { name: '仪表板', path: '/dashboard', icon: HomeIcon },
    { name: '设备管理', path: '/devices', icon: DevicePhoneMobileIcon },
    { name: '连接管理', path: '/connection', icon: ServerIcon },
    { name: '数据监控', path: '/monitoring', icon: ChartBarIcon },
    { name: '指令控制', path: '/control', icon: CommandLineIcon },
    { name: '设置', path: '/settings', icon: Cog6ToothIcon },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-windows-bg">
      {/* 侧边栏 */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-20'}
          bg-white border-r border-windows-border
          flex flex-col transition-all duration-300 ease-in-out
          shadow-windows
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-windows-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-windows-primary rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-lg text-windows-text">Smart Link</span>
            )}
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-windows-primary text-white'
                    : 'text-windows-text hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-windows-border">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-windows-text hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
            {sidebarOpen && <span className="text-sm">收起菜单</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-windows-border flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-windows-text">
            {navigation.find(item => isActive(item.path))?.name || 'Smart Link Assistant'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-windows-textSecondary">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>系统正常</span>
            </div>
            <div className="w-8 h-8 bg-windows-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
              A
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout
