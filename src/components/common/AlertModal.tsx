import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import './AlertModal.css'

interface AlertModalProps {
  isOpen: boolean
  title?: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  onClose: () => void
  confirmText?: string
}

const AlertModal = ({
  isOpen,
  title,
  message,
  type = 'info',
  onClose,
  confirmText = '확인',
}: AlertModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        } else if (e.key === 'Enter') {
          onClose()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

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

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'info'
    }
  }

  const getTitle = () => {
    if (title) return title
    switch (type) {
      case 'success':
        return '성공'
      case 'warning':
        return '경고'
      case 'error':
        return '오류'
      default:
        return '알림'
    }
  }

  return (
    <div className="alert-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="alert-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div
          ref={headerRef}
          className={`alert-modal-header alert-modal-${type} alert-modal-drag-handle`}
          onMouseDown={handleMouseDown}
        >
          <span className="material-icons alert-modal-icon">{getIcon()}</span>
          <h2 className="alert-modal-title">{getTitle()}</h2>
        </div>
        <div className="alert-modal-body">
          <p>{message}</p>
        </div>
        <div className="alert-modal-footer">
          <Button variant="primary" onClick={onClose}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
