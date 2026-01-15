import { useState, useEffect, useRef } from 'react'
import { TableColumn } from '../types'
import { userApi, User, CreateUserDto, UpdateUserDto } from '../services/api'
import { Button, Section, Table } from '../components/common'
import UserForm from '../components/UserForm'
import SearchModal from '../components/common/SearchModal'
import { useListPage } from '../hooks/useListPage'
import { useConfirm } from '../hooks/useConfirm'
import './UserManagement.css'

// 검색 필터 함수
const userSearchFilter = (user: User, searchType: string, searchValue: string): boolean => {
  const value = searchValue.toLowerCase().trim()
  switch (searchType) {
    case 'name':
      return user.name?.toLowerCase().includes(value) || false
    case 'department':
      return user.department?.toLowerCase().includes(value) || false
    case 'id':
      return user.id?.toLowerCase().includes(value) || false
    default:
      return true
  }
}

const UserManagement = () => {
  const {
    items: users,
    loading,
    isFormOpen,
    isSearchOpen,
    editingItem: editingUser,
    selectedItem: selectedUser,
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
  } = useListPage<User, CreateUserDto, UpdateUserDto>({
    apiService: userApi,
    keyExtractor: (user) => user.id,
    searchFilterFn: userSearchFilter,
    fetchParams: { status: '활성' },
    getDeleteMessage: (user) => `정말로 "${user.name}" 사용자를 삭제하시겠습니까?`,
    getDeleteTitle: () => '사용자 삭제',
    getSuccessMessage: (action) => {
      switch (action) {
        case 'create':
          return '사용자가 추가되었습니다.'
        case 'update':
          return '사용자 정보가 수정되었습니다.'
        case 'delete':
          return '사용자가 삭제되었습니다.'
      }
    },
    enableKeyboardShortcuts: false, // F4 키는 UserManagement에서 직접 처리
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
  }, [selectedUser])

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

  const [checkedUsers, setCheckedUsers] = useState<Set<string>>(new Set())
  const checkedUsersRef = useRef<Set<string>>(new Set())
  const { showConfirm: showConfirmChecked, ConfirmComponent: CheckedConfirmComponent } = useConfirm()

  // checkedUsers가 변경될 때마다 ref 업데이트
  useEffect(() => {
    checkedUsersRef.current = checkedUsers
  }, [checkedUsers])

  const handleCheckboxChange = (userId: string, checked: boolean) => {
    setCheckedUsers((prev: Set<string>) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const handleDeleteChecked = () => {
    if (checkedUsers.size === 0) return

    const checkedCount = checkedUsers.size
    showConfirmChecked(
      `선택한 ${checkedCount}개의 사용자를 삭제하시겠습니까?`,
      async () => {
        try {
          const checkedIds = Array.from(checkedUsers)
          for (const id of checkedIds) {
            await userApi.delete(id)
          }
          setCheckedUsers(new Set())
          fetchItems()
        } catch (error) {
          console.error('삭제 오류:', error)
        }
      },
      {
        title: '사용자 삭제',
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
      }
    )
  }

  // 키보드 단축키 처리 (F1, F2, F3, F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

      // F1: 검색 (검색 폼이 열려있을 때도 브라우저 기본 F1 도움말을 막기 위해 항상 처리)
      if (e.key === 'F1') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        // 이미 검색 폼이 열려 있다면 더 이상 처리하지 않고 여기서 종료 (브라우저 기본만 막음)
        if (isSearchOpen) {
          return
        }
        // 검색 폼이 닫혀 있을 때만 열기
        if (document.activeElement instanceof HTMLElement) {
          if (
            document.activeElement instanceof HTMLInputElement ||
            document.activeElement instanceof HTMLTextAreaElement
          ) {
            document.activeElement.blur()
          }
        }
        setIsSearchOpen(true)
      }
      // F2: 추가 모드 토글 또는 저장
      else if (e.key === 'F2') {
        // SearchModal이 열려있으면 F2~F4, 방향키 동작 안 함
        if (isSearchOpen) return
        // 추가 모드이고 편집 중일 때: 필드가 모두 비어있으면 취소
        if (isEditModeRef.current && editingUser === undefined) {
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
              e.stopImmediatePropagation() // UserForm의 핸들러가 처리하지 못하도록
              
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
          // 필드에 값이 있으면 이벤트를 전달하여 UserForm의 F2 핸들러가 저장 처리
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
        if (isSearchOpen) return
        if (selectedUser) {
          if (isEditModeRef.current) {
            // 수정 모드일 때: UserForm의 F3 핸들러가 처리
            // 여기서는 아무것도 하지 않음 - UserForm이 처리함
            return
          } else {
            // 수정 모드가 아닐 때: 수정 모드로 전환
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            handleEdit(selectedUser)
            setIsEditMode(true)
            isEditModeRef.current = true
          }
        }
      }
      // F4: 삭제 (체크된 항목이 있으면 복수 삭제, 없으면 단일 삭제)
      else if (e.key === 'F4') {
        if (isSearchOpen) return
        e.preventDefault()
        e.stopPropagation()
        // 활성 요소에서 포커스 제거 (검은색 테두리 방지)
        const activeElement = document.activeElement
        if (activeElement instanceof HTMLElement) {
          activeElement.blur()
        }
        // 다음 이벤트 루프에서 실행하여 포커스 문제 방지
        setTimeout(() => {
          const currentChecked = checkedUsersRef.current
          if (currentChecked.size > 0) {
            // 복수 삭제
            const checkedCount = currentChecked.size
            const checkedIds = Array.from(currentChecked)
            showConfirmChecked(
              `선택한 ${checkedCount}개의 사용자를 삭제하시겠습니까?`,
              async () => {
                try {
                  for (const id of checkedIds) {
                    await userApi.delete(id)
                  }
                  setCheckedUsers(new Set())
                  fetchItems()
                } catch (error) {
                  console.error('삭제 오류:', error)
                }
              },
              {
                title: '사용자 삭제',
                type: 'danger',
                confirmText: '삭제',
                cancelText: '취소',
              }
            )
          } else if (selectedUser) {
            // 단일 삭제
            handleDelete(selectedUser)
          }
        }, 0)
      }
      // ArrowUp: 위 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowUp' && !isEditModeRef.current) {
        if (isSearchOpen) return
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
        if (users.length > 0) {
          if (selectedUser) {
            const selectedKey = selectedUser.id
            const currentIndex = users.findIndex((user) => user.id === selectedKey)
            if (currentIndex > 0) {
              const userToSelect = users[currentIndex - 1]
              handleRowClick(userToSelect, currentIndex - 1)
            }
          } else {
            const userToSelect = users[users.length - 1]
            handleRowClick(userToSelect, users.length - 1)
          }
        }
      }
      // ArrowDown: 아래 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowDown' && !isEditModeRef.current) {
        if (isSearchOpen) return
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
        if (users.length > 0) {
          if (selectedUser) {
            const selectedKey = selectedUser.id
            const currentIndex = users.findIndex((user) => user.id === selectedKey)
            if (currentIndex < users.length - 1) {
              const userToSelect = users[currentIndex + 1]
              handleRowClick(userToSelect, currentIndex + 1)
            }
          } else {
            const userToSelect = users[0]
            handleRowClick(userToSelect, 0)
          }
        }
      }
    }

    // capture phase에서 먼저 처리하여 UserForm의 핸들러보다 먼저 실행
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isFormOpen, isSearchOpen, selectedUser, users, handleAdd, handleEdit, handleDelete, handleRowClick, setIsSearchOpen, showConfirmChecked, fetchItems])

  const columns: TableColumn<User>[] = [
    {
      key: 'pr',
      label: 'PR',
      width: '50px',
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={checkedUsers.has(row.id)}
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
    { key: 'id', label: 'ID', width: '120px' },
    { key: 'name', label: '사용자명' },
    { key: 'grade', label: '등급' },
    { key: 'department', label: '부서' },
  ]

  return (
    <div className="user-management">
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
            onClick={() => selectedUser && handleEdit(selectedUser)} 
            type="button" 
            size="small"
            variant="warning"
            disabled={!selectedUser}
            title={!selectedUser ? '행을 선택한 후 수정할 수 있습니다' : ''}
          >
            <span>F3 수정</span>
          </Button>
          <Button 
            onClick={() => {
              if (checkedUsers.size > 0) {
                handleDeleteChecked()
              } else if (selectedUser) {
                handleDelete(selectedUser)
              }
            }}
            type="button" 
            size="small"
            variant="danger"
            disabled={!selectedUser && checkedUsers.size === 0}
            title={
              checkedUsers.size > 0
                ? `선택한 ${checkedUsers.size}개 항목 삭제`
                : !selectedUser
                ? '행을 선택한 후 삭제할 수 있습니다'
                : ''
            }
          >
            <span>F4 삭제{checkedUsers.size > 0 ? ` (${checkedUsers.size})` : ''}</span>
          </Button>
        </div>
      </div>

      {/* 중간 입력 폼 */}
      <UserForm
        user={isEditMode && editingUser ? editingUser : (!isEditMode && selectedUser ? selectedUser : undefined)}
        isOpen={true}
        isEditMode={isEditMode}
        onSave={async (data) => {
          try {
            isSavingRef.current = true
            await handleSave(data)
            
            // 저장 후 수정 모드 해제 (editingUser는 handleSave에서 업데이트되지만, isEditMode가 false이면 무시됨)
            isEditModeRef.current = false
            setIsEditMode(false)
            
            // editingUser를 초기화하기 위해 handleCancel 호출
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
      <Section title="▲사용자 목록">
        <Table
          columns={columns}
          data={users}
          emptyMessage="등록된 사용자가 없습니다."
          loading={loading}
          onRowClick={handleRowClick}
          keyExtractor={(user) => user.id}
          selectedRow={selectedUser}
        />
      </Section>

      <SearchModal
        isOpen={isSearchOpen}
        onSearch={handleSearch}
        onClose={() => setIsSearchOpen(false)}
        searchTypes={[
          { value: 'name', label: '사용자명' },
          { value: 'department', label: '부서' },
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

export default UserManagement
