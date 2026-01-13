import { useState, useCallback } from 'react'
import AlertModal from '../components/common/AlertModal'

interface AlertOptions {
  title?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
}

export const useAlert = () => {
  const [alert, setAlert] = useState<{
    isOpen: boolean
    message: string
    title?: string
    type?: 'info' | 'success' | 'warning' | 'error'
    confirmText?: string
  }>({
    isOpen: false,
    message: '',
  })

  const showAlert = useCallback(
    (message: string, options?: AlertOptions) => {
      setAlert({
        isOpen: true,
        message,
        title: options?.title,
        type: options?.type || 'info',
        confirmText: options?.confirmText,
      })
    },
    []
  )

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert(message, { type: 'success', title })
  }, [showAlert])

  const showError = useCallback((message: string, title?: string) => {
    showAlert(message, { type: 'error', title })
  }, [showAlert])

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert(message, { type: 'warning', title })
  }, [showAlert])

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const AlertComponent = () => (
    <AlertModal
      isOpen={alert.isOpen}
      title={alert.title}
      message={alert.message}
      type={alert.type}
      onClose={closeAlert}
      confirmText={alert.confirmText}
    />
  )

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    AlertComponent,
  }
}
