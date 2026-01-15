import { useState, useEffect, useCallback, useRef } from 'react'
import { PurchaseAccount, CreatePurchaseAccountDto, UpdatePurchaseAccountDto } from '../services/api'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'
import './AccountForm.css'

interface PurchaseAccountFormProps {
  account?: PurchaseAccount
  onSave: (data: CreatePurchaseAccountDto | UpdatePurchaseAccountDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  isEditMode?: boolean
}

const PurchaseAccountForm = ({ account, onSave, isOpen, isEditMode = false }: PurchaseAccountFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    printName: '',
    representative: '',
    address: '',
    postalCode: '',
    phone: '',
    registrationNumber: '',
    fax: '',
    businessType: '',
    businessCategory: '',
    remarks: '',
    depositAccount: '',
    paymentDate: '',
    closingDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showError, AlertComponent } = useAlert()

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        printName: account.printName || '',
        representative: account.representative || '',
        address: account.address || '',
        postalCode: account.postalCode || '',
        phone: account.phone || '',
        registrationNumber: account.registrationNumber || '',
        fax: account.fax || '',
        businessType: account.businessType || '',
        businessCategory: account.businessCategory || '',
        remarks: account.remarks || '',
        depositAccount: account.depositAccount || '',
        paymentDate: account.paymentDate || '',
        closingDate: account.closingDate || '',
      })
    } else {
      setFormData({
        name: '',
        printName: '',
        representative: '',
        address: '',
        postalCode: '',
        phone: '',
        registrationNumber: '',
        fax: '',
        businessType: '',
        businessCategory: '',
        remarks: '',
        depositAccount: '',
        paymentDate: '',
        closingDate: '',
      })
    }
    setErrors({})
  }, [account, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '거래처명을 입력해주세요.'
    }

    // 사업자등록번호 검증 (입력된 경우만)
    if (formData.registrationNumber.trim()) {
      const numbers = formData.registrationNumber.replace(/[^\d]/g, '')
      if (numbers.length !== 10) {
        newErrors.registrationNumber = '사업자등록번호는 10자리 숫자여야 합니다.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 사업자등록번호 포맷팅 (XXX-XX-XXXXX)
  const formatRegistrationNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '')
    const limited = numbers.slice(0, 10)
    
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 5)}-${limited.slice(5)}`
    }
  }

  // 전화번호/FAX 포맷팅
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^\d]/g, '')
    const limited = numbers.slice(0, 11)
    
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 2)}-${limited.slice(2)}`
    } else if (limited.length <= 10) {
      if (limited.length === 10 && limited.startsWith('02')) {
        return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`
      } else {
        if (limited.startsWith('02')) {
          return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`
        } else {
          return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
        }
      }
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
    }
  }

  const handleChange = (field: string, value: string) => {
    let processedValue = value
    
    if (field === 'registrationNumber') {
      processedValue = formatRegistrationNumber(value)
    } else if (field === 'phone' || field === 'fax') {
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // 저장 로직을 별도 함수로 분리
  const performSave = useCallback(async () => {
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      if (account) {
        // 수정
        const updateData: UpdatePurchaseAccountDto = {
          name: formData.name,
          printName: formData.printName || undefined,
          representative: formData.representative || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          phone: formData.phone || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          fax: formData.fax || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          remarks: formData.remarks || undefined,
          depositAccount: formData.depositAccount || undefined,
          paymentDate: formData.paymentDate || undefined,
          closingDate: formData.closingDate || undefined,
        }
        await onSave(updateData)
      } else {
        // 생성
        const createData: CreatePurchaseAccountDto = {
          name: formData.name,
          printName: formData.printName || undefined,
          representative: formData.representative || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          phone: formData.phone || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          fax: formData.fax || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          remarks: formData.remarks || undefined,
          depositAccount: formData.depositAccount || undefined,
          paymentDate: formData.paymentDate || undefined,
          closingDate: formData.closingDate || undefined,
        }
        await onSave(createData)
      }
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || '저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [formData, account, onSave, showError])

  // F2/F3 키로 저장 (추가 모드는 F2, 수정 모드는 F3)
  const savingRef = useRef(false)
  useEffect(() => {
    if (isEditMode) {
      const handleKeyDown = (e: KeyboardEvent) => {
        // 추가 모드: F2로 저장, 수정 모드: F3로 저장
        const shouldSave = (account && e.key === 'F3') || (!account && e.key === 'F2')
        if (shouldSave) {
          // 추가 모드이고 F2를 누른 경우: 모든 필드가 비어있으면 저장하지 않고 상위 핸들러가 처리하도록
          if (!account && e.key === 'F2') {
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
  }, [isEditMode, account, loading, performSave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performSave()
  }

  return (
    <>
      <div className="inline-form-container">
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={(e) => {
            // Enter 키로 폼 제출 방지
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
          className="inline-form-content"
        >
            <div className="form-fields">
              {/* Row 1: 거래처명(왼), 출력명(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    거래처명 <span className="required">*</span>
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

                <div className="form-group">
                  <label>출력명</label>
                  <input
                    type="text"
                    value={formData.printName}
                    onChange={(e) => handleChange('printName', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 2: 대표자(왼), 전화번호(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>대표자</label>
                  <input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleChange('representative', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>전화번호</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 3: 주소(왼), 등록번호(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>주소</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>등록번호</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    disabled={loading || !isEditMode}
                    maxLength={12}
                    className={errors.registrationNumber ? 'error' : ''}
                  />
                  {errors.registrationNumber && (
                    <span className="error-message">{errors.registrationNumber}</span>
                  )}
                </div>
              </div>

              {/* Row 4: 우편물(왼), FAX(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>우편물</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>FAX</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => handleChange('fax', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 5: 업태(왼), 종목(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>업태</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group">
                  <label>종목</label>
                  <input
                    type="text"
                    value={formData.businessCategory}
                    onChange={(e) => handleChange('businessCategory', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 6: 비고(왼 textarea), 입금계좌(오) */}
              <div className="form-row">
                <div className="form-group">
                  <label>비고</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    disabled={loading || !isEditMode}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>입금계좌</label>
                  <input
                    type="text"
                    value={formData.depositAccount}
                    onChange={(e) => handleChange('depositAccount', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

            </div>

        </form>
      </div>

      <AlertComponent />
    </>
  )
}

export default PurchaseAccountForm