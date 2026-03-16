import React, { useState, useEffect } from 'react'
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// Toast 类型
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
}

// Toast 组件
const Toast = ({ message, type = ToastType.INFO, onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // 等待动画结束
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const icons = {
    [ToastType.SUCCESS]: CheckCircleIcon,
    [ToastType.ERROR]: ExclamationCircleIcon,
    [ToastType.INFO]: InformationCircleIcon,
    [ToastType.WARNING]: ExclamationTriangleIcon
  }

  const colors = {
    [ToastType.SUCCESS]: 'bg-green-50 text-green-800 border-green-200',
    [ToastType.ERROR]: 'bg-red-50 text-red-800 border-red-200',
    [ToastType.INFO]: 'bg-blue-50 text-blue-800 border-blue-200',
    [ToastType.WARNING]: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  }

  const IconComponent = icons[type] || icons[ToastType.INFO]
  const colorClass = colors[type] || colors[ToastType.INFO]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${colorClass} ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onClose, 300)
        }}
        className="flex-shrink-0 p-0.5 hover:opacity-75 transition-opacity"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

// Toast 容器组件
const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = ToastType.INFO, duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const success = (message, duration) => addToast(message, ToastType.SUCCESS, duration)
  const error = (message, duration) => addToast(message, ToastType.ERROR, duration)
  const info = (message, duration) => addToast(message, ToastType.INFO, duration)
  const warning = (message, duration) => addToast(message, ToastType.WARNING, duration)

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    ToastContainer: (props) => <ToastContainer toasts={toasts} onRemove={removeToast} {...props} />
  }
}

// Alert 组件（用于静态显示）
export const Alert = ({ type = ToastType.INFO, message, onClose, className = '' }) => {
  const icons = {
    [ToastType.SUCCESS]: CheckCircleIcon,
    [ToastType.ERROR]: ExclamationCircleIcon,
    [ToastType.INFO]: InformationCircleIcon,
    [ToastType.WARNING]: ExclamationTriangleIcon
  }

  const colors = {
    [ToastType.SUCCESS]: 'bg-green-50 text-green-800 border-green-200',
    [ToastType.ERROR]: 'bg-red-50 text-red-800 border-red-200',
    [ToastType.INFO]: 'bg-blue-50 text-blue-800 border-blue-200',
    [ToastType.WARNING]: 'bg-yellow-50 text-yellow-800 border-yellow-200'
  }

  const IconComponent = icons[type] || icons[ToastType.INFO]
  const colorClass = colors[type] || colors[ToastType.INFO]

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colorClass} ${className}`}>
      <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-0.5 hover:opacity-75 transition-opacity"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Toast
