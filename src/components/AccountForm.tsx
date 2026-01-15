import { useState, useEffect, useCallback, useRef } from 'react'
import { Account, CreateAccountDto, UpdateAccountDto } from '../services/api'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'
import './AccountForm.css'

interface AccountFormProps {
  account?: Account
  onSave: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
  isEditMode?: boolean
  onSaveTrigger?: () => void
}

const AccountForm = ({ account, onSave, isOpen, isEditMode = false }: AccountFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    printName: '',
    registrationNumber: '',
    representative: '',
    residentRegistrationNumber: '',
    phone: '',
    fax: '',
    address: '',
    postalCode: '',
    businessType: '',
    businessCategory: '',
    electronicInvoiceInput: '',
    email: '',
    collectionDate: '',
    remarks: '',
    closingDate: '',
    invoice: '',
    contactPerson: '',
    contactPersonPhone: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { showError, AlertComponent } = useAlert()

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        printName: account.printName || '',
        registrationNumber: account.registrationNumber || '',
        representative: account.representative || '',
        residentRegistrationNumber: account.residentRegistrationNumber || '',
        phone: account.phone || '',
        fax: account.fax || '',
        address: account.address || '',
        postalCode: account.postalCode || '',
        businessType: account.businessType || '',
        businessCategory: account.businessCategory || '',
        electronicInvoiceInput: account.electronicInvoiceInput || '',
        email: account.email || '',
        collectionDate: account.collectionDate || '',
        remarks: account.remarks || '',
        closingDate: account.closingDate || '',
        invoice: account.invoice || '',
        contactPerson: account.contactPerson || '',
        contactPersonPhone: account.contactPersonPhone || '',
      })
    } else {
      setFormData({
        name: '',
        printName: '',
        registrationNumber: '',
        representative: '',
        residentRegistrationNumber: '',
        phone: '',
        fax: '',
        address: '',
        postalCode: '',
        businessType: '',
        businessCategory: '',
        electronicInvoiceInput: '',
        email: '',
        collectionDate: '',
        remarks: '',
        closingDate: '',
        invoice: '',
        contactPerson: '',
        contactPersonPhone: '',
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

  // 저장 로직을 별도 함수로 분리
  const performSave = useCallback(async () => {
    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      if (account) {
        // 수정
        const updateData: UpdateAccountDto = {
          name: formData.name,
          printName: formData.printName || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          representative: formData.representative || undefined,
          residentRegistrationNumber: formData.residentRegistrationNumber || undefined,
          phone: formData.phone || undefined,
          fax: formData.fax || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          electronicInvoiceInput: formData.electronicInvoiceInput || undefined,
          email: formData.email || undefined,
          collectionDate: formData.collectionDate || undefined,
          remarks: formData.remarks || undefined,
          closingDate: formData.closingDate || undefined,
          invoice: formData.invoice || undefined,
          contactPerson: formData.contactPerson || undefined,
          contactPersonPhone: formData.contactPersonPhone || undefined,
        }
        await onSave(updateData)
      } else {
        // 생성 - ID는 자동 생성되므로 서버에서 생성
        const createData: CreateAccountDto = {
          id: '', // 백엔드에서 자동 생성됨
          name: formData.name,
          printName: formData.printName || undefined,
          registrationNumber: formData.registrationNumber || undefined,
          representative: formData.representative || undefined,
          residentRegistrationNumber: formData.residentRegistrationNumber || undefined,
          phone: formData.phone || undefined,
          fax: formData.fax || undefined,
          address: formData.address || undefined,
          postalCode: formData.postalCode || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          electronicInvoiceInput: formData.electronicInvoiceInput || undefined,
          email: formData.email || undefined,
          collectionDate: formData.collectionDate || undefined,
          remarks: formData.remarks || undefined,
          closingDate: formData.closingDate || undefined,
          invoice: formData.invoice || undefined,
          contactPerson: formData.contactPerson || undefined,
          contactPersonPhone: formData.contactPersonPhone || undefined,
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

  // 사업자등록번호 포맷팅 (XXX-XX-XXXXX)
  const formatRegistrationNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')
    
    // 10자리 제한
    const limited = numbers.slice(0, 10)
    
    // 하이픈 추가
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
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')
    
    // 11자리 제한
    const limited = numbers.slice(0, 11)
    
    // 하이픈 추가
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 6) {
      // 02-1234 또는 010-1234
      return `${limited.slice(0, 2)}-${limited.slice(2)}`
    } else if (limited.length <= 10) {
      // 02-1234-5678 또는 031-123-4567
      if (limited.length === 10 && limited.startsWith('02')) {
        // 서울: 02-1234-5678 (2-4-4)
        return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`
      } else {
        // 지역번호: 031-123-4567 (3-3-4) 또는 02-1234-5678 (2-4-4)
        if (limited.startsWith('02')) {
          return `${limited.slice(0, 2)}-${limited.slice(2, 6)}-${limited.slice(6)}`
        } else {
          return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
        }
      }
    } else {
      // 휴대전화: 010-1234-5678 (3-4-4)
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`
    }
  }

  // 주민번호 포맷팅 (XXXXXX-XXXXXXX)
  const formatResidentRegistrationNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '')
    
    // 13자리 제한
    const limited = numbers.slice(0, 13)
    
    // 하이픈 추가
    if (limited.length <= 6) {
      return limited
    } else {
      return `${limited.slice(0, 6)}-${limited.slice(6)}`
    }
  }

  const handleChange = (field: string, value: string) => {
    let processedValue = value
    
    // 등록번호 필드는 자동 포맷팅
    if (field === 'registrationNumber') {
      processedValue = formatRegistrationNumber(value)
    } else if (field === 'phone' || field === 'fax' || field === 'contactPersonPhone') {
      // 전화번호와 FAX, 담당자 전화번호 필드는 자동 포맷팅
      processedValue = formatPhoneNumber(value)
    } else if (field === 'residentRegistrationNumber') {
      // 주민번호 필드는 자동 포맷팅
      processedValue = formatResidentRegistrationNumber(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
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
                <div className="form-group account-form-medium-field">
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

                <div className="form-group account-form-medium-field">
                  <label>출력명</label>
                  <input
                    type="text"
                    value={formData.printName}
                    onChange={(e) => handleChange('printName', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 2: 등록번호(왼), (오른쪽 빈칸) */}
              <div className="form-row">
                <div className="form-group account-form-very-short-field">
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
                <div className="form-group"></div>
              </div>

              {/* Row 3: 대표자(왼), 주민번호(오) */}
              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>대표자</label>
                  <input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleChange('representative', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group account-form-very-short-field">
                  <label>주민번호</label>
                  <input
                    type="text"
                    value={formData.residentRegistrationNumber}
                    onChange={(e) => handleChange('residentRegistrationNumber', e.target.value)}
                    disabled={loading || !isEditMode}
                    maxLength={14}
                  />
                </div>
              </div>

              {/* Row 4: 전화번호(왼), FAX(오) */}
              <div className="form-row">
                <div className="form-group account-form-medium-field">
                  <label>전화번호</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group account-form-medium-field">
                  <label>FAX</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => handleChange('fax', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 5: 주소 */}
              <div className="form-row">
                <div className="form-group account-form-very-long-field">
                  <label>주소</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
                <div className="form-group"></div>
              </div>

              {/* Row 6: 우편물 */}
              <div className="form-row">
                <div className="form-group account-form-very-short-field">
                  <label>우편물</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
                <div className="form-group"></div>
              </div>

              {/* Row 7: 업태(왼), 종목(오) */}
              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>업태</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group account-form-short-field">
                  <label>종목</label>
                  <input
                    type="text"
                    value={formData.businessCategory}
                    onChange={(e) => handleChange('businessCategory', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 8: 전자계산서 입력항목(헤더 왼), E-mail(오) */}
              <div className="form-row">
                <div className="form-group account-form-section-header">
                  <label>전자계산서 입력항목</label>
                </div>
                <div className="form-group account-form-medium-field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 9: 계산서(라디오 버튼) */}
              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>계산서</label>
                  <div className="account-form-invoice-options">
                    <label className="account-form-invoice-option">
                      <input
                        type="radio"
                        name="invoice"
                        value="월말"
                        checked={formData.invoice === '월말'}
                        onChange={(e) => handleChange('invoice', e.target.value)}
                        disabled={loading || !isEditMode}
                      />
                      <span>월말</span>
                    </label>
                    <label className="account-form-invoice-option">
                      <input
                        type="radio"
                        name="invoice"
                        value="즉시"
                        checked={formData.invoice === '즉시'}
                        onChange={(e) => handleChange('invoice', e.target.value)}
                        disabled={loading || !isEditMode}
                      />
                      <span>즉시</span>
                    </label>
                  </div>
                </div>
                <div className="form-group"></div>
              </div>

              {/* Row 10: 수금일(왼), 비고(중간), 담당자(오) */}
              <div className="form-row account-form-remarks-row">
                <div className="form-group account-form-very-short-field">
                  <label>수금일</label>
                  <input
                    type="text"
                    value={formData.collectionDate}
                    onChange={(e) => handleChange('collectionDate', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group account-form-remarks-field">
                  <label>비고</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => handleChange('remarks', e.target.value)}
                    disabled={loading || !isEditMode}
                    rows={2}
                  />
                </div>

                <div className="form-group account-form-very-short-field">
                  <label>담당자</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleChange('contactPerson', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>
              </div>

              {/* Row 11: 마감일(왼), 전화번호(담당자 전화번호, 오) */}
              <div className="form-row">
                <div className="form-group account-form-very-short-field">
                  <label>마감일</label>
                  <input
                    type="text"
                    value={formData.closingDate}
                    onChange={(e) => handleChange('closingDate', e.target.value)}
                    disabled={loading || !isEditMode}
                  />
                </div>

                <div className="form-group account-form-medium-field">
                  <label>전화번호</label>
                  <input
                    type="text"
                    value={formData.contactPersonPhone}
                    onChange={(e) => handleChange('contactPersonPhone', e.target.value)}
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

export default AccountForm
