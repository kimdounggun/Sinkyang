import { useState, useEffect, useRef } from 'react'
import { Account, CreateAccountDto, UpdateAccountDto } from '../services/api'
import { Button } from './common'
import { useAlert } from '../hooks/useAlert'
import './UserForm.css'
import './AccountForm.css'

interface AccountFormProps {
  account?: Account
  onSave: (data: CreateAccountDto | UpdateAccountDto) => Promise<void>
  onCancel: () => void
  isOpen: boolean
}

const AccountForm = ({ account, onSave, onCancel, isOpen }: AccountFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    representative: '',
    phone: '',
    fax: '',
    businessType: '',
    businessCategory: '',
    item: '',
    invoice: '',
    collectionDate: '',
    closingDate: '',
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
    if (account) {
      setFormData({
        name: account.name || '',
        registrationNumber: account.registrationNumber || '',
        representative: account.representative || '',
        phone: account.phone || '',
        fax: account.fax || '',
        businessType: account.businessType || '',
        businessCategory: account.businessCategory || '',
        item: account.item || '',
        invoice: account.invoice || '',
        collectionDate: account.collectionDate || '',
        closingDate: account.closingDate || '',
      })
    } else {
      setFormData({
        name: '',
        registrationNumber: '',
        representative: '',
        phone: '',
        fax: '',
        businessType: '',
        businessCategory: '',
        item: '',
        invoice: '',
        collectionDate: '',
        closingDate: '',
      })
    }
    setErrors({})
  }, [account, isOpen])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    try {
      if (account) {
        // 수정
        const updateData: UpdateAccountDto = {
          name: formData.name,
          registrationNumber: formData.registrationNumber || undefined,
          representative: formData.representative || undefined,
          phone: formData.phone || undefined,
          fax: formData.fax || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          item: formData.item || undefined,
          invoice: formData.invoice || undefined,
          collectionDate: formData.collectionDate || undefined,
          closingDate: formData.closingDate || undefined,
        }
        await onSave(updateData)
      } else {
        // 생성 - ID는 자동 생성되므로 빈 문자열로 전송하거나 서버에서 생성
        const createData: CreateAccountDto = {
          id: '', // 백엔드에서 자동 생성되도록 빈 값 전송
          name: formData.name,
          registrationNumber: formData.registrationNumber || undefined,
          representative: formData.representative || undefined,
          phone: formData.phone || undefined,
          fax: formData.fax || undefined,
          businessType: formData.businessType || undefined,
          businessCategory: formData.businessCategory || undefined,
          item: formData.item || undefined,
          invoice: formData.invoice || undefined,
          collectionDate: formData.collectionDate || undefined,
          closingDate: formData.closingDate || undefined,
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

  const handleChange = (field: string, value: string) => {
    let processedValue = value
    
    // 등록번호 필드는 자동 포맷팅
    if (field === 'registrationNumber') {
      processedValue = formatRegistrationNumber(value)
    } else if (field === 'phone' || field === 'fax') {
      // 전화번호와 FAX 필드는 자동 포맷팅
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: processedValue }))
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
            <h2>{account ? '거래처 수정' : '거래처 추가'}</h2>
            <button className="user-form-close" onClick={onCancel}>
              <span className="material-icons">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="user-form-content">
            <div className="form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    거래처명 <span className="required">*</span>
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

                <div className="form-group">
                  <label>등록번호</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    disabled={loading}
                    maxLength={12}
                    className={errors.registrationNumber ? 'error' : ''}
                  />
                  {errors.registrationNumber && (
                    <span className="error-message">{errors.registrationNumber}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>대표자</label>
                  <input
                    type="text"
                    value={formData.representative}
                    onChange={(e) => handleChange('representative', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>전화번호</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>FAX</label>
                  <input
                    type="text"
                    value={formData.fax}
                    onChange={(e) => handleChange('fax', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group account-form-short-field">
                  <label>업 태</label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group account-form-short-field">
                  <label>종 목</label>
                  <input
                    type="text"
                    value={formData.businessCategory}
                    onChange={(e) => handleChange('businessCategory', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>계산서</label>
                  <div className="account-form-invoice-options">
                    <label className="account-form-invoice-option">
                      <input
                        type="radio"
                        name="invoice"
                        value="월말"
                        checked={formData.invoice === '월말'}
                        onChange={(e) => handleChange('invoice', e.target.value)}
                        disabled={loading}
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
                        disabled={loading}
                      />
                      <span>즉시</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>수금일</label>
                  <input
                    type="text"
                    value={formData.collectionDate}
                    onChange={(e) => handleChange('collectionDate', e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>마감일</label>
                  <input
                    type="text"
                    value={formData.closingDate}
                    onChange={(e) => handleChange('closingDate', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="user-form-actions">
              <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? '저장 중...' : account ? '수정' : '추가'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AlertComponent />
    </>
  )
}

export default AccountForm
