import { useState, useEffect, useCallback, useRef } from 'react'
import { Field, CreateFieldDto, UpdateFieldDto, Account, accountApi } from '../services/api'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'
import './AccountForm.css'

interface FieldFormProps {
  field?: Field
  onSave: (data: CreateFieldDto | UpdateFieldDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  isEditMode?: boolean
}

const FieldForm = ({ field, onSave, onCancel, isOpen, isEditMode = false }: FieldFormProps) => {
  const [formData, setFormData] = useState({
    id: '',
    accountId: '',
    fieldName: '',
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showError, AlertComponent } = useAlert()

  // 거래처 목록 로드
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const response = await accountApi.getAll({ limit: 1000 })
        setAccounts(response.data || [])
      } catch (error) {
        console.error('거래처 목록 로드 오류:', error)
      }
    }
    loadAccounts()
  }, [])

  useEffect(() => {
    if (field) {
      setFormData({
        id: field.id,
        accountId: field.accountId || '',
        fieldName: field.fieldName || '',
      })
    } else {
      setFormData({
        id: '',
        accountId: '',
        fieldName: '',
      })
    }
    setErrors({})
  }, [field, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.accountId.trim()) {
      newErrors.accountId = '거래처를 선택해주세요.'
    }

    if (!formData.fieldName.trim()) {
      newErrors.fieldName = '현장명을 입력해주세요.'
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
      if (field) {
        // 수정
        const updateData: UpdateFieldDto = {
          id: formData.id !== field.id ? formData.id : undefined,
          accountId: formData.accountId,
          fieldName: formData.fieldName,
        }
        await onSave(updateData)
      } else {
        // 생성
        const createData: CreateFieldDto = {
          id: formData.id || undefined,
          accountId: formData.accountId,
          fieldName: formData.fieldName,
        }
        await onSave(createData)
      }
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [formData, field, onSave, showError])

  // F2/F3 키로 저장 (추가 모드는 F2, 수정 모드는 F3)
  const savingRef = useRef(false)
  useEffect(() => {
    if (isEditMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // 추가 모드: F2로 저장, 수정 모드: F3로 저장
        const shouldSave = (field && e.key === 'F3') || (!field && e.key === 'F2')

        if (shouldSave) {
          // 입력 필드에 포커스가 있으면 저장하지 않음 (사용자가 입력 중일 수 있음)
          const activeElement = document.activeElement
          if (
            activeElement &&
            (activeElement.tagName === 'INPUT' ||
              activeElement.tagName === 'TEXTAREA' ||
              activeElement.tagName === 'SELECT')
          ) {
            // 입력 필드에서 포커스가 나가면 저장
            if (e.key === 'F2' || e.key === 'F3') {
              ;(activeElement as HTMLElement).blur()
              // blur 이벤트 후 저장 실행
              setTimeout(() => {
                if (!savingRef.current && !loading) {
                  performSave()
                }
              }, 100)
            }
            return
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
  }, [isEditMode, field, loading, performSave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSave()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="inline-form-content">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accountId">
                거래처 <span className="required">*</span>
              </label>
              <select
                id="accountId"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                disabled={!isEditMode}
                className={errors.accountId ? 'error' : ''}
              >
                <option value="">선택하세요</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.id} - {account.name}
                  </option>
                ))}
              </select>
              {errors.accountId && <span className="error-message">{errors.accountId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fieldName">
                현장명 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="fieldName"
                value={formData.fieldName}
                onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                disabled={!isEditMode}
                className={errors.fieldName ? 'error' : ''}
              />
              {errors.fieldName && <span className="error-message">{errors.fieldName}</span>}
            </div>
          </div>
        </form>
      </div>
      <AlertComponent />
    </>
  )
}

export default FieldForm
