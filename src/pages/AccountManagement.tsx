import { useState, useEffect, useRef } from 'react'
import { TableColumn } from '../types'
import { accountApi, Account, CreateAccountDto, UpdateAccountDto } from '../services/api'
import { Button, Section, Table } from '../components/common'
import AccountForm from '../components/AccountForm'
import SearchModal from '../components/common/SearchModal'
import { useListPage } from '../hooks/useListPage'
import { useConfirm } from '../hooks/useConfirm'
import './AccountManagement.css'

// 검색 필터 함수
const accountSearchFilter = (account: Account, searchType: string, searchValue: string): boolean => {
  const value = searchValue.toLowerCase().trim()
  switch (searchType) {
    case 'name':
      return account.name?.toLowerCase().includes(value) || false
    case 'representative':
      return account.representative?.toLowerCase().includes(value) || false
    case 'id':
      return account.id?.toLowerCase().includes(value) || false
    default:
      return true
  }
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

  // 키보드 단축키 처리 (F1, F2, F3, F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // SearchModal이 열려있으면 단축키 무시 (인라인 폼은 항상 열려있으므로 isFormOpen은 체크하지 않음)
      if (isSearchOpen) return

      // F1-F4 키와 방향키는 입력 필드에서도 작동하도록 예외 처리
      const isFKey = e.key === 'F1' || e.key === 'F2' || e.key === 'F3' || e.key === 'F4'
      const isArrowKey = e.key === 'ArrowUp' || e.key === 'ArrowDown'
      
      // 수정 모드가 아닐 때만 방향키 처리
      if (isArrowKey && isEditModeRef.current) {
        return
      }
      
      // F키나 방향키가 아니고 입력 필드에 포커스가 있으면 단축키 무시 (체크박스는 제외)
      if (
        !isFKey &&
        !isArrowKey &&
        (
          (e.target instanceof HTMLInputElement && e.target.type !== 'checkbox') ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable)
        )
      ) {
        return
      }
      
      // 방향키는 수정 모드가 아닐 때만 처리
      if (isArrowKey && isEditModeRef.current) {
        return
      }

      // F1: 검색 (행 선택 안 되어 있을 때만)
      if (e.key === 'F1') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        // 포커스 제거
        if (document.activeElement instanceof HTMLElement) {
          if (document.activeElement instanceof HTMLInputElement || 
              document.activeElement instanceof HTMLTextAreaElement) {
            document.activeElement.blur()
          }
        }
        if (!selectedAccount) {
          setIsSearchOpen(true)
        }
      }
      // F2: 추가 모드 토글 또는 저장
      else if (e.key === 'F2') {
        // 추가 모드이고 편집 중일 때: 필드가 모두 비어있으면 취소
        if (isEditModeRef.current && editingAccount === undefined) {
          // 모든 입력 필드 확인
          const form = document.querySelector('.inline-form-content')
          if (form) {
            const inputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
            let hasValue = false
            
            inputs.forEach((input) => {
              if (input.value && input.value.trim() !== '') {
                hasValue = true
              }
            })
            
            // 모든 필드가 비어있으면 추가 모드 취소
            if (!hasValue) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation() // AccountForm의 핸들러가 처리하지 못하도록
              
              setIsEditMode(false)
              isEditModeRef.current = false
              handleCancel()
              
              // 포커스 제거
              inputs.forEach((input) => {
                if (input instanceof HTMLElement) {
                  input.blur()
                }
              })
              
              // 테이블에 포커스
              setTimeout(() => {
                const table = document.querySelector('.data-table')
                if (table) {
                  (table as HTMLElement).focus()
                } else {
                  document.body.focus()
                }
              }, 50)
              
              return // 이벤트 전파 중단
            }
          }
          // 필드에 값이 있으면 이벤트를 전달하여 AccountForm의 F2 핸들러가 저장 처리
        } else {
          // 추가 모드가 아닐 때: 추가 모드로 진입
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          
          handleAdd()
          setIsEditMode(true) // 추가 모드일 때는 편집 가능
          isEditModeRef.current = true // ref도 즉시 업데이트
          // 약간의 지연 후 첫 번째 입력 필드에 포커스
          setTimeout(() => {
            const form = document.querySelector('.inline-form-content')
            if (form) {
              const firstInput = form.querySelector('input:not([type="checkbox"]):not([type="radio"]), textarea') as HTMLElement
              if (firstInput) {
                firstInput.focus()
              }
            }
          }, 50)
        }
      }
      // F3: 수정 모드 토글 또는 저장
      else if (e.key === 'F3') {
        if (selectedAccount) {
          if (isEditModeRef.current) {
            // 수정 모드일 때: AccountForm의 F3 핸들러가 처리
            // 여기서는 아무것도 하지 않음 - AccountForm이 처리함
            return
          } else {
            // 수정 모드가 아닐 때: 수정 모드로 전환
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            handleEdit(selectedAccount)
            setIsEditMode(true)
            isEditModeRef.current = true
          }
        }
      }
      // F4: 삭제 (체크된 항목이 있으면 복수 삭제, 없으면 단일 삭제)
      else if (e.key === 'F4') {
        e.preventDefault()
        e.stopPropagation()
        // 활성 요소에서 포커스 제거 (검은색 테두리 방지)
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement) {
          activeElement.blur()
        }
        // 다음 이벤트 루프에서 실행하여 포커스 문제 방지
        setTimeout(() => {
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
        }, 0)
      }
      // ArrowUp: 위 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowUp' && !isEditModeRef.current) {
        e.preventDefault()
        e.stopPropagation()
        // 모든 입력 필드에서 포커스 강제 제거
        const form = document.querySelector('.inline-form-content')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select')
          inputs.forEach((input) => {
            if (input instanceof HTMLElement) {
              input.blur()
            }
          })
        }
        // 현재 활성 요소도 blur
        if (document.activeElement instanceof HTMLElement) {
          if (document.activeElement instanceof HTMLInputElement || 
              document.activeElement instanceof HTMLTextAreaElement ||
              document.activeElement instanceof HTMLSelectElement) {
            document.activeElement.blur()
          }
        }
        if (accounts.length > 0) {
          if (selectedAccount) {
            const selectedKey = selectedAccount.id
            const currentIndex = accounts.findIndex((account) => account.id === selectedKey)
            if (currentIndex > 0) {
              const accountToSelect = accounts[currentIndex - 1]
              handleRowClick(accountToSelect, currentIndex - 1)
            }
          } else {
            const accountToSelect = accounts[accounts.length - 1]
            handleRowClick(accountToSelect, accounts.length - 1)
          }
        }
      }
      // ArrowDown: 아래 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowDown' && !isEditModeRef.current) {
        e.preventDefault()
        e.stopPropagation()
        // 모든 입력 필드에서 포커스 강제 제거
        const form = document.querySelector('.inline-form-content')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select')
          inputs.forEach((input) => {
            if (input instanceof HTMLElement) {
              input.blur()
            }
          })
        }
        // 현재 활성 요소도 blur
        if (document.activeElement instanceof HTMLElement) {
          if (document.activeElement instanceof HTMLInputElement || 
              document.activeElement instanceof HTMLTextAreaElement ||
              document.activeElement instanceof HTMLSelectElement) {
            document.activeElement.blur()
          }
        }
        if (accounts.length > 0) {
          if (selectedAccount) {
            const selectedKey = selectedAccount.id
            const currentIndex = accounts.findIndex((account) => account.id === selectedKey)
            if (currentIndex < accounts.length - 1) {
              const accountToSelect = accounts[currentIndex + 1]
              handleRowClick(accountToSelect, currentIndex + 1)
            }
          } else {
            const accountToSelect = accounts[0]
            handleRowClick(accountToSelect, 0)
          }
        }
      }
    }

    // capture phase에서 먼저 처리하여 AccountForm의 핸들러보다 먼저 실행
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isFormOpen, isSearchOpen, selectedAccount, accounts, handleAdd, handleEdit, handleDelete, handleRowClick, setIsSearchOpen, showConfirmChecked, fetchItems])

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
      <Section title="▲매출거래처 목록">
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
        searchTypes={[
          { value: 'name', label: '거래처명' },
          { value: 'representative', label: '대표자' },
          { value: 'id', label: 'ID' },
        ]}
        defaultSearchType="name"
      />

      <AlertComponent />
      <ConfirmComponent />
      <CheckedConfirmComponent />
    </div>
  )
}

export default AccountManagement
