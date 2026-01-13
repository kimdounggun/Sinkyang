import { useState, useEffect, useRef } from 'react'
import { User, CreateUserDto, UpdateUserDto } from '../services/api'
import { Button } from './common'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'

interface UserFormProps {
  user?: User
  onSave: (data: CreateUserDto | UpdateUserDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

const UserForm = ({ user, onSave, onCancel, isOpen }: UserFormProps) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    grade: '일반사용자',
    department: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showError, AlertComponent } = useAlert()
  const modalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name || '',
        grade: user.grade || '일반사용자',
        department: user.department || '',
      })
    } else {
      setFormData({
        id: '',
        name: '',
        grade: '일반사용자',
        department: '',
      })
    }
    setErrors({})
  }, [user, isOpen])

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onCancel])

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

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.id.trim()) {
      newErrors.id = 'ID를 입력해주세요.'
    }

    if (!formData.name.trim()) {
      newErrors.name = '사용자명을 입력해주세요.'
    }

    if (!formData.department.trim()) {
      newErrors.department = '부서를 입력해주세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      if (user) {
        // 수정
        const updateData: UpdateUserDto = {
          id: formData.id !== user.id ? formData.id : undefined,
          name: formData.name,
          grade: formData.grade,
          department: formData.department,
        }
        await onSave(updateData)
      } else {
        // 생성
        const createData: CreateUserDto = {
          id: formData.id,
          name: formData.name,
          grade: formData.grade,
          department: formData.department,
        }
        await onSave(createData)
      }
    } catch (error) {
      console.error('저장 오류:', error)
      showError(
        error instanceof Error
          ? error.message
          : '저장 중 오류가 발생했습니다.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="user-form-overlay" onClick={onCancel}>
        <div
          ref={modalRef}
          className="user-form-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
            cursor: isDragging ? 'grabbing' : 'default',
          }}
        >
          <div
            ref={headerRef}
            className="user-form-header user-form-drag-handle"
            onMouseDown={handleMouseDown}
          >
            <h2>{user ? '사용자 수정' : '사용자 추가'}</h2>
            <button className="user-form-close" onClick={onCancel}>
              <span className="material-icons">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form-content">
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    ID <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => handleChange('id', e.target.value)}
                    disabled={loading}
                    className={errors.id ? 'error' : ''}
                  />
                  {errors.id && <span className="error-message">{errors.id}</span>}
                </div>

                <div className="form-group">
                  <label>
                    사용자명 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={loading}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    등급 <span className="required">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleChange('grade', e.target.value)}
                    disabled={loading}
                  >
                    <option value="일반사용자">일반사용자</option>
                    <option value="관리자">관리자</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    부서 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    disabled={loading}
                    className={errors.department ? 'error' : ''}
                  />
                  {errors.department && (
                    <span className="error-message">{errors.department}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="user-form-actions">
              <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? '저장 중...' : user ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AlertComponent />
    </>
  )
}

export default UserForm
