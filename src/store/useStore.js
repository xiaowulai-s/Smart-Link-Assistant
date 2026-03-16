import { create } from 'zustand'

const useStore = create((set, get) => ({
  // 设备列表
  devices: [],
  setDevices: (devices) => set({ devices }),

  // 当前选中的设备
  selectedDevice: null,
  setSelectedDevice: (device) => set({ selectedDevice: device }),

  // 连接状态
  connections: {},
  setConnections: (connections) => set({ connections }),

  // 添加设备
  addDevice: (device) => set((state) => ({
    devices: [...state.devices, { ...device, id: Date.now() }]
  })),

  // 删除设备
  removeDevice: (deviceId) => set((state) => ({
    devices: state.devices.filter(d => d.id !== deviceId)
  })),

  // 更新设备
  updateDevice: (deviceId, updates) => set((state) => ({
    devices: state.devices.map(d =>
      d.id === deviceId ? { ...d, ...updates } : d
    )
  })),

  // 实时数据
  realtimeData: {},
  setRealtimeData: (deviceId, data) => set((state) => ({
    realtimeData: {
      ...state.realtimeData,
      [deviceId]: data
    }
  })),

  // 历史数据
  historyData: [],
  setHistoryData: (data) => set({ historyData: data }),

  // 命令历史
  commandHistory: [],
  setCommandHistory: (history) => set({ commandHistory: history }),

  // 添加命令历史
  addCommandHistory: (command) => set((state) => ({
    commandHistory: [
      { ...command, timestamp: new Date().toISOString() },
      ...state.commandHistory
    ].slice(0, 100) // 保留最近100条
  })),
}))

export default useStore
