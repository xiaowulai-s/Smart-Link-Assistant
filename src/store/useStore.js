import { create } from 'zustand'
import LocalStorageService from '../services/storage/LocalStorageService'

// 从本地存储加载初始数据
const initialDevices = LocalStorageService.loadDevices()
const initialCommandHistory = LocalStorageService.loadCommandHistory()
const initialConnections = LocalStorageService.loadConnections()
const initialErrors = LocalStorageService.loadErrors()

const useStore = create((set, get) => ({
  // 设备列表
  devices: initialDevices,
  setDevices: (devices) => {
    set({ devices })
    LocalStorageService.saveDevices(devices)
  },

  // 当前选中的设备
  selectedDevice: null,
  setSelectedDevice: (device) => set({ selectedDevice: device }),

  // 连接状态
  connections: initialConnections,
  setConnections: (connections) => {
    set({ connections })
    LocalStorageService.saveConnections(connections)
  },

  // 错误状态
  errors: initialErrors,
  addError: (error) => set((state) => {
    const newErrors = [
      { ...error, id: Date.now(), timestamp: new Date().toISOString() },
      ...state.errors
    ].slice(0, 50)
    LocalStorageService.saveErrors(newErrors)
    return { errors: newErrors }
  }),
  removeError: (errorId) => set((state) => {
    const newErrors = state.errors.filter(e => e.id !== errorId)
    LocalStorageService.saveErrors(newErrors)
    return { errors: newErrors }
  }),
  clearErrors: () => {
    LocalStorageService.saveErrors([])
    set({ errors: [] })
  },

  // 添加设备
  addDevice: (device) => set((state) => {
    const newDevices = [...state.devices, { ...device, id: Date.now() }]
    LocalStorageService.saveDevices(newDevices)
    return { devices: newDevices }
  }),

  // 删除设备
  removeDevice: (deviceId) => set((state) => {
    const newDevices = state.devices.filter(d => d.id !== deviceId)
    LocalStorageService.saveDevices(newDevices)
    return { devices: newDevices }
  }),

  // 更新设备
  updateDevice: (deviceId, updates) => set((state) => {
    const newDevices = state.devices.map(d =>
      d.id === deviceId ? { ...d, ...updates } : d
    )
    LocalStorageService.saveDevices(newDevices)
    return { devices: newDevices }
  }),

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
  commandHistory: initialCommandHistory,
  setCommandHistory: (history) => {
    set({ commandHistory: history })
    LocalStorageService.saveCommandHistory(history)
  },

  // 添加命令历史
  addCommandHistory: (command) => set((state) => {
    const newHistory = [
      { ...command, timestamp: new Date().toISOString() },
      ...state.commandHistory
    ].slice(0, 100)
    LocalStorageService.saveCommandHistory(newHistory)
    return { commandHistory: newHistory }
  }),
}))

export default useStore
