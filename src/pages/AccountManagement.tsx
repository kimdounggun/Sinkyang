import { useState, useEffect } from 'react'
import { TableColumn } from '../types'
import { accountApi, Account, CreateAccountDto, UpdateAccountDto } from '../services/api'
import ListPageTemplate from '../templates/ListPageTemplate'
import { Button } from '../components/common'
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

  const [checkedAccounts, setCheckedAccounts] = useState<Set<string>>(new Set())
  const { showConfirm: showConfirmChecked, ConfirmComponent: CheckedConfirmComponent } = useConfirm()

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
      // 모달이 열려있으면 단축키 무시
      if (isFormOpen || isSearchOpen) return

      // 입력 필드에 포커스가 있으면 단축키 무시
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // F1: 검색
      if (e.key === 'F1') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      // F2: 추가
      else if (e.key === 'F2') {
        e.preventDefault()
        handleAdd()
      }
      // F3: 수정
      else if (e.key === 'F3') {
        e.preventDefault()
        if (selectedAccount) {
          handleEdit(selectedAccount)
        }
      }
      // F4: 삭제 (체크된 항목이 있으면 복수 삭제, 없으면 단일 삭제)
      else if (e.key === 'F4') {
        e.preventDefault()
        if (checkedAccounts.size > 0) {
          handleDeleteChecked()
        } else if (selectedAccount) {
          handleDelete(selectedAccount)
        }
      }
      // ArrowUp: 위 행 선택
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
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
      // ArrowDown: 아래 행 선택
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
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

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormOpen, isSearchOpen, checkedAccounts, selectedAccount, accounts, handleAdd, handleEdit, handleDelete, handleDeleteChecked, handleRowClick, setIsSearchOpen])

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
          }}
          onClick={(e) => e.stopPropagation()}
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
      <ListPageTemplate
        columns={columns}
        data={accounts}
        loading={loading}
        emptyMessage="등록된 거래처가 없습니다."
        sectionActions={
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
        }
        keyExtractor={(account) => account.id}
        onRowClick={handleRowClick}
        selectedRow={selectedAccount}
      />

      <AccountForm
        account={editingAccount}
        isOpen={isFormOpen}
        onSave={handleSave}
        onCancel={handleCancel}
      />

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
