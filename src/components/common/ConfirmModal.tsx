import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import './ConfirmModal.css'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'warning' | 'danger'
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

const ConfirmModal = ({
  isOpen,
  title,
  message,
  type = 'warning',
  onConfirm,
  onCancel,
  confirmText = '확인',
  cancelText = '취소',
}: ConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel()
        } else if (e.key === 'Enter') {
          onConfirm()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel, onConfirm])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (headerRef.current?.contains(e.target as Node) && modalRef.current) {
      setIsDragging(true)
      const rect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (modalRef.current) {
        const centerX = window.innerWidth / 2
        const centerY = window.innerHeight / 2
        const newX = e.clientX - dragOffset.x - centerX + modalRef.current.offsetWidth / 2
        const newY = e.clientY - dragOffset.y - centerY + modalRef.current.offsetHeight / 2
        setPosition({ x: newX, y: newY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    if (!isOpen) {
      setPosition({ x: 0, y: 0 })
      setIsDragging(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div
        ref={modalRef}
        className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div
          ref={headerRef}
          className={`confirm-modal-header confirm-modal-${type} confirm-modal-drag-handle`}
          onMouseDown={handleMouseDown}
        >
          <span className="material-icons confirm-modal-icon">
            {type === 'danger' ? 'error' : 'warning'}
          </span>
          <h2 className="confirm-modal-title">{title || '확인'}</h2>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
