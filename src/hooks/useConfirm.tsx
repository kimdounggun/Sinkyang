import { useState, useCallback } from 'react'
import ConfirmModal from '../components/common/ConfirmModal'

interface ConfirmOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger'
}

export const useConfirm = () => {
  const [confirm, setConfirm] = useState<{
    isOpen: boolean
    message: string
    title?: string
    confirmText?: string
    cancelText?: string
    type?: 'warning' | 'danger'
    onConfirm: () => void
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  })

  const showConfirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: ConfirmOptions
    ) => {
      setConfirm({
        isOpen: true,
        message,
        title: options?.title,
        confirmText: options?.confirmText,
        cancelText: options?.cancelText,
        type: options?.type || 'warning',
        onConfirm,
      })
    },
    []
  )

  const closeConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const handleConfirm = useCallback(() => {
    confirm.onConfirm()
    closeConfirm()
  }, [confirm, closeConfirm])

  const ConfirmComponent = () => (
    <ConfirmModal
      isOpen={confirm.isOpen}
      title={confirm.title}
      message={confirm.message}
      type={confirm.type}
      onConfirm={handleConfirm}
      onCancel={closeConfirm}
      confirmText={confirm.confirmText}
      cancelText={confirm.cancelText}
    />
  )

  return {
    showConfirm,
    ConfirmComponent,
  }
}
