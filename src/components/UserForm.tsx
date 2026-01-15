import { useState, useEffect, useCallback, useRef } from 'react'
import { User, CreateUserDto, UpdateUserDto } from '../services/api'
import { Button } from './common'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'
import './AccountForm.css'

interface UserFormProps {
  user?: User
  onSave: (data: CreateUserDto | UpdateUserDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  isEditMode?: boolean
}

const UserForm = ({ user, onSave, onCancel, isOpen, isEditMode = false }: UserFormProps) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    grade: '일반사용자',
    department: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showError, AlertComponent } = useAlert()

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

  // 저장 로직을 별도 함수로 분리
  const performSave = useCallback(async () => {
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
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [formData, user, onSave, showError])

  // F2/F3 키로 저장 (추가 모드는 F2, 수정 모드는 F3)
  const savingRef = useRef(false)
  useEffect(() => {
    if (isEditMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // 추가 모드: F2로 저장, 수정 모드: F3로 저장
        const shouldSave = (user && e.key === 'F3') || (!user && e.key === 'F2')
        if (shouldSave) {
          // 추가 모드이고 F2를 누른 경우: 모든 필드가 비어있으면 저장하지 않고 상위 핸들러가 처리하도록
          if (!user && e.key === 'F2') {
            const form = document.querySelector('.inline-form-content')
            if (form) {
              const inputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
              let hasValue = false
              
              inputs.forEach((input) => {
                if (input.value && input.value.trim() !== '') {
                  hasValue = true
                }
              })
              
              // 모든 필드가 비어있으면 이벤트를 상위 핸들러에 전달 (취소 처리)
              if (!hasValue) {
                return // 이벤트를 전달하여 상위 핸들러가 취소 처리
              }
            }
          }
          
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation() // 상위 핸들러가 처리하지 못하도록 차단
          
          // 이미 저장 중이면 무시
          if (savingRef.current || loading) {
            return
          }
          
          // 저장 시작
          savingRef.current = true
          
          // 저장 전에 모든 입력 필드 blur
          const form = document.querySelector('.inline-form-content')
          if (form) {
            const inputs = form.querySelectorAll('input, textarea, select')
            inputs.forEach((input) => {
              if (input instanceof HTMLElement) {
                input.blur()
              }
            })
          }
          
          // 저장 실행
          performSave()
            .finally(() => {
              // 저장 완료 후 약간의 지연 후 플래그 해제
              setTimeout(() => {
                savingRef.current = false
              }, 100)
            })
            .catch((error) => {
              console.error('저장 오류:', error)
              savingRef.current = false
            })
        }
      }
      // capture phase에서 먼저 처리
      document.addEventListener('keydown', handleKeyDown, true)
      return () => document.removeEventListener('keydown', handleKeyDown, true)
    }
    // isEditMode가 false일 때도 포커스 정리
    else {
      savingRef.current = false // 수정 모드 해제 시 저장 플래그도 해제
      const cleanup = () => {
        const form = document.querySelector('.inline-form-content')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select')
          inputs.forEach((input) => {
            if (input instanceof HTMLElement && document.activeElement === input) {
              input.blur()
            }
          })
        }
      }
      const timeoutId = setTimeout(cleanup, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [isEditMode, user, loading, performSave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSave()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <>
      <div className="inline-form-container">
        <form
          onSubmit={handleSubmit}
          className="inline-form-content"
          onKeyDown={(e) => {
            // Enter로 전체 폼이 바로 제출되는 것을 방지하고, 명시적인 버튼 클릭/단축키로 저장하도록 유지
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        >
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
                  disabled={loading || !isEditMode}
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
                  disabled={loading || !isEditMode}
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
                  disabled={loading || !isEditMode}
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
                  disabled={loading || !isEditMode}
                  className={errors.department ? 'error' : ''}
                />
                {errors.department && (
                  <span className="error-message">{errors.department}</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      <AlertComponent />
    </>
  )
}

export default UserForm
