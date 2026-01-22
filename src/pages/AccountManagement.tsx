import { useState, useEffect, useRef } from 'react'
import { TableColumn } from '../types'
import { accountApi, Account, CreateAccountDto, UpdateAccountDto } from '../services/api'
import { Button, Section, Table } from '../components/common'
import AccountForm from '../components/AccountForm'
import SearchModal from '../components/common/SearchModal'
import { useListPage } from '../hooks/useListPage'
import { useConfirm } from '../hooks/useConfirm'
import { useListPageHotkeys } from '../hooks/useListPageHotkeys'
import './AccountManagement.css'

// 검색 필터 함수 (통합 검색: 모든 필드에서 검색)
const accountSearchFilter = (account: Account, searchValue: string): boolean => {
  const value = searchValue.toLowerCase().trim()
  if (!value) return true
  
  // 모든 필드를 통합 검색
  return (
    account.id?.toLowerCase().includes(value) ||
    account.name?.toLowerCase().includes(value) ||
    account.printName?.toLowerCase().includes(value) ||
    account.registrationNumber?.toLowerCase().includes(value) ||
    account.representative?.toLowerCase().includes(value) ||
    account.phone?.toLowerCase().includes(value) ||
    account.fax?.toLowerCase().includes(value) ||
    account.address?.toLowerCase().includes(value) ||
    account.businessType?.toLowerCase().includes(value) ||
    account.businessCategory?.toLowerCase().includes(value) ||
    account.email?.toLowerCase().includes(value) ||
    account.contactPerson?.toLowerCase().includes(value) ||
    account.contactPersonPhone?.toLowerCase().includes(value) ||
    false
  )
}

const AccountManagement = () => {
  const {
    items: accounts,
    loading,
    isFormOpen,
    isSearchOpen,
    editingItem: editingAccount,
    selectedItem: selectedAccount,
    setIsSearchOpen,
    setIsFormOpen,
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleSearch,
    handleRowClick,
    fetchItems,
    AlertComponent,
    ConfirmComponent,
  } = useListPage<Account, CreateAccountDto, UpdateAccountDto>({
    apiService: accountApi,
    keyExtractor: (account) => account.id,
    searchFilterFn: accountSearchFilter,
    getDeleteMessage: (account) => `정말로 "${account.name}" 거래처를 삭제하시겠습니까?`,
    getDeleteTitle: () => '거래처 삭제',
    getSuccessMessage: (action) => {
      switch (action) {
        case 'create':
          return '거래처가 추가되었습니다.'
        case 'update':
          return '거래처 정보가 수정되었습니다.'
        case 'delete':
          return '거래처가 삭제되었습니다.'
      }
    },
    enableKeyboardShortcuts: false, // F4 키는 AccountManagement에서 직접 처리
  })

  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false)
  // isEditMode의 최신 값을 참조하기 위한 ref
  const isEditModeRef = useRef(false)
  
  // isEditMode가 변경될 때 ref 업데이트
  useEffect(() => {
    isEditModeRef.current = isEditMode
  }, [isEditMode])

  // 저장 중 플래그
  const isSavingRef = useRef(false)
  
  // 선택된 항목이 변경될 때 수정 모드 해제 (저장 중이 아닐 때만)
  useEffect(() => {
    if (!isSavingRef.current) {
      setIsEditMode(false)
      isEditModeRef.current = false
    }
  }, [selectedAccount])

  // 수정 모드가 끝날 때 입력 필드 포커스 제거 (방향키 작동을 위해)
  useEffect(() => {
    if (!isEditMode) {
      // 약간의 지연을 두어 상태 업데이트 후 포커스 제거
      const timeoutId = setTimeout(() => {
        // 모든 입력 필드 blur
        const form = document.querySelector('.inline-form-content')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select, button')
          inputs.forEach((input) => {
            if (input instanceof HTMLElement) {
              input.blur()
            }
          })
        }
        
        // 현재 활성 요소 blur
        const activeEl = document.activeElement
        if (activeEl instanceof HTMLElement) {
          if (activeEl instanceof HTMLInputElement || 
              activeEl instanceof HTMLTextAreaElement ||
              activeEl instanceof HTMLButtonElement ||
              activeEl instanceof HTMLSelectElement) {
            activeEl.blur()
          }
        }
        
        // body에 포커스 부여
        if (document.body) {
          if (!document.body.hasAttribute('tabindex')) {
            document.body.setAttribute('tabindex', '-1')
          }
          document.body.focus()
        }
      }, 100)
      
      return () => clearTimeout(timeoutId)
    }
  }, [isEditMode])

  const [checkedAccounts, setCheckedAccounts] = useState<Set<string>>(new Set())
  const checkedAccountsRef = useRef<Set<string>>(new Set())
  const { showConfirm: showConfirmChecked, ConfirmComponent: CheckedConfirmComponent } = useConfirm()

  // checkedAccounts가 변경될 때마다 ref 업데이트
  useEffect(() => {
    checkedAccountsRef.current = checkedAccounts
  }, [checkedAccounts])

  const handleCheckboxChange = (accountId: string, checked: boolean) => {
    setCheckedAccounts((prev: Set<string>) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(accountId)
      } else {
        newSet.delete(accountId)
      }
      return newSet
    })
  }

  const handleDeleteChecked = () => {
    if (checkedAccounts.size === 0) return

    const checkedCount = checkedAccounts.size
    showConfirmChecked(
      `선택한 ${checkedCount}개의 거래처를 삭제하시겠습니까?`,
      async () => {
        try {
          const checkedIds = Array.from(checkedAccounts)
          for (const id of checkedIds) {
            await accountApi.delete(id)
          }
          setCheckedAccounts(new Set())
          fetchItems()
        } catch (error) {
          console.error('삭제 오류:', error)
        }
      },
      {
        title: '거래처 삭제',
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
      }
    )
  }

  // F4 삭제 처리 (체크된 항목이 있으면 복수 삭제, 없으면 단일 삭제)
  const handleDeleteWithChecked = () => {
    const currentChecked = checkedAccountsRef.current
    if (currentChecked.size > 0) {
      // 복수 삭제
      const checkedCount = currentChecked.size
      const checkedIds = Array.from(currentChecked)
      showConfirmChecked(
        `선택한 ${checkedCount}개의 거래처를 삭제하시겠습니까?`,
        async () => {
          try {
            for (const id of checkedIds) {
              await accountApi.delete(id)
            }
            setCheckedAccounts(new Set())
            fetchItems()
          } catch (error) {
            console.error('삭제 오류:', error)
          }
        },
        {
          title: '거래처 삭제',
          type: 'danger',
          confirmText: '삭제',
          cancelText: '취소',
        }
      )
    } else if (selectedAccount) {
      // 단일 삭제
      handleDelete(selectedAccount)
    }
  }

  // F2 추가 모드 취소 체크 (필드가 비어있는지 확인)
  const checkEmptyFields = () => {
    const form = document.querySelector('.inline-form-content')
    if (form) {
      const inputs = form.querySelectorAll(
        'input:not([type="checkbox"]):not([type="radio"]), textarea'
      ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
      let hasValue = false

      inputs.forEach((input) => {
        if (input.value && input.value.trim() !== '') {
          hasValue = true
        }
      })

      return !hasValue // 비어있으면 true
    }
    return false
  }

  // 키보드 단축키 처리 (공통 훅 사용)
  useListPageHotkeys({
    isSearchOpen,
    setIsSearchOpen,
    isEditMode,
    setIsEditMode,
    isEditModeRef,
    selectedItem: selectedAccount,
    items: accounts,
    editingItem: editingAccount,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCancel,
    handleRowClick,
    keyExtractor: (account) => account.id,
    checkEmptyFields,
    handleDeleteWithChecked,
  })

  const columns: TableColumn<Account>[] = [
    {
      key: 'pr',
      label: 'PR',
      width: '50px',
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={checkedAccounts.has(row.id)}
          onChange={(e) => {
            e.stopPropagation()
            handleCheckboxChange(row.id, e.target.checked)
            // 체크박스 클릭 후 포커스 제거 (검은색 테두리 방지)
            if (e.target instanceof HTMLElement) {
              e.target.blur()
            }
          }}
          onClick={(e) => {
            e.stopPropagation()
            // 체크박스 클릭 후 즉시 포커스 제거
            setTimeout(() => {
              if (e.target instanceof HTMLElement) {
                e.target.blur()
              }
            }, 0)
          }}
          onKeyDown={(e) => {
            // 체크박스에서 F1-F4 키 입력 시 브라우저 기본 동작 방지
            if (e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4') {
              e.preventDefault()
              e.stopPropagation()
            }
          }}
        />
      ),
    },
    { key: 'name', label: '거래처명' },
    { key: 'registrationNumber', label: '등록번호' },
    { key: 'representative', label: '대표자' },
    { key: 'phone', label: '전화번호' },
    { key: 'fax', label: 'FAX' },
    { key: 'businessType', label: '업 태' },
    { key: 'businessCategory', label: '종 목' },
    { key: 'invoice', label: '계산서' },
    { key: 'collectionDate', label: '수금일' },
    { key: 'closingDate', label: '마감일' },
  ]

  return (
    <div className="account-management">
      {/* 상단 버튼들 */}
      <div className="account-page-header">
        <div className="section-actions">
          <Button 
            onClick={() => setIsSearchOpen(true)} 
            type="button" 
            size="small"
            variant="outline"
          >
            <span>F1 검색</span>
          </Button>
          <Button onClick={handleAdd} type="button" size="small">
            <span>F2 추가</span>
          </Button>
          <Button 
            onClick={() => selectedAccount && handleEdit(selectedAccount)} 
            type="button" 
            size="small"
            variant="warning"
            disabled={!selectedAccount}
            title={!selectedAccount ? '행을 선택한 후 수정할 수 있습니다' : ''}
          >
            <span>F3 수정</span>
          </Button>
          <Button 
            onClick={() => {
              if (checkedAccounts.size > 0) {
                handleDeleteChecked()
              } else if (selectedAccount) {
                handleDelete(selectedAccount)
              }
            }}
            type="button" 
            size="small"
            variant="danger"
            disabled={!selectedAccount && checkedAccounts.size === 0}
            title={
              checkedAccounts.size > 0
                ? `선택한 ${checkedAccounts.size}개 항목 삭제`
                : !selectedAccount
                ? '행을 선택한 후 삭제할 수 있습니다'
                : ''
            }
          >
            <span>F4 삭제{checkedAccounts.size > 0 ? ` (${checkedAccounts.size})` : ''}</span>
          </Button>
        </div>
      </div>

      {/* 중간 입력 폼 */}
      <AccountForm
        account={isEditMode && editingAccount ? editingAccount : (!isEditMode && selectedAccount ? selectedAccount : undefined)}
        isOpen={true}
        isEditMode={isEditMode}
        onSave={async (data) => {
          try {
            isSavingRef.current = true
            await handleSave(data)
            
            // 저장 후 수정 모드 해제 (editingAccount는 handleSave에서 업데이트되지만, isEditMode가 false이면 무시됨)
            isEditModeRef.current = false
            setIsEditMode(false)
            
            // editingAccount를 초기화하기 위해 handleCancel 호출
            handleCancel()
            // 인라인 폼이므로 isFormOpen을 다시 true로 설정 (handleCancel이 false로 만듦)
            setTimeout(() => {
              setIsFormOpen(true)
            }, 0)
            
            // 약간의 지연 후 저장 플래그 해제 및 포커스 제거
            setTimeout(() => {
              isSavingRef.current = false
              
              // 포커스 강제 제거
              const form = document.querySelector('.inline-form-content')
              if (form) {
                const inputs = form.querySelectorAll('input, textarea, select, button')
                inputs.forEach((input) => {
                  if (input instanceof HTMLElement) {
                    input.blur()
                  }
                })
              }
              if (document.activeElement instanceof HTMLElement) {
                if (document.activeElement instanceof HTMLInputElement || 
                    document.activeElement instanceof HTMLTextAreaElement) {
                  document.activeElement.blur()
                }
              }
              if (document.body) {
                if (!document.body.hasAttribute('tabindex')) {
                  document.body.setAttribute('tabindex', '-1')
                }
                document.body.focus()
              }
            }, 50)
          } catch (error) {
            // 에러 발생 시에도 수정 모드 해제 및 포커스 제거
            isSavingRef.current = false
            setIsEditMode(false)
            isEditModeRef.current = false
            const form = document.querySelector('.inline-form-content')
            if (form) {
              const inputs = form.querySelectorAll('input, textarea, select')
              inputs.forEach((input) => {
                if (input instanceof HTMLElement) {
                  input.blur()
                }
              })
            }
            if (document.body) {
              document.body.focus()
            }
          }
        }}
        onCancel={() => {
          handleCancel()
          setIsEditMode(false)
        }}
      />

      {/* 하단 테이블 */}
      <Section>
        <Table
          columns={columns}
          data={accounts}
          emptyMessage="등록된 거래처가 없습니다."
          loading={loading}
          onRowClick={handleRowClick}
          keyExtractor={(account) => account.id}
          selectedRow={selectedAccount}
        />
      </Section>

      <SearchModal
        isOpen={isSearchOpen}
        onSearch={handleSearch}
        onClose={() => setIsSearchOpen(false)}
      />

      <AlertComponent />
      <ConfirmComponent />
      <CheckedConfirmComponent />
    </div>
  )
}

export default AccountManagement
