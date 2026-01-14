import { useState, useEffect } from 'react'
import { TableColumn } from '../types'
import { userApi, User, CreateUserDto, UpdateUserDto } from '../services/api'
import ListPageTemplate from '../templates/ListPageTemplate'
import { Button } from '../components/common'
import UserForm from '../components/UserForm'
import SearchModal, { SearchType } from '../components/common/SearchModal'
import { useAlert } from '../hooks/useAlert'
import { useConfirm } from '../hooks/useConfirm'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([]) // 전체 사용자 목록
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const { showSuccess, showError, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getAll({ status: '활성' })
      const userList = response.data || []
      setAllUsers(userList)
      setUsers(userList)

      // 선택된 사용자가 있으면 업데이트된 데이터로 선택 유지
      if (selectedUser) {
        const updatedUser = userList.find((u) => u.id === selectedUser.id)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        }
      }
    } catch (error) {
      // 백엔드 연결 실패 시 빈 배열로 설정 (에러 로그는 최소화)
      setUsers([])
      setAllUsers([])
      // 에러는 한 번만 로그 (React StrictMode로 인한 중복 방지)
      if (!error) return
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 사용자 추가
  const handleAdd = () => {
    setEditingUser(undefined)
    setIsFormOpen(true)
    // 추가는 선택 해제하지 않음 (기존 선택 유지)
  }

  // 사용자 수정
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
    // 수정 모달을 열어도 선택 유지
  }

  // 사용자 삭제
  const handleDelete = (user: User) => {
    showConfirm(
      `정말로 "${user.name}" 사용자를 삭제하시겠습니까?`,
      async () => {
        try {
          await userApi.delete(user.id)
          showSuccess('사용자가 삭제되었습니다.')

          // 삭제 후 선택 해제 (삭제된 행이므로)
          setSelectedUser(null)
          fetchUsers()
        } catch (error) {
          console.error('사용자 삭제 오류:', error)
          showError(
            error instanceof Error
              ? error.message
              : '사용자 삭제 중 오류가 발생했습니다.'
          )
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

  // 폼 저장
  const handleSave = async (data: CreateUserDto | UpdateUserDto) => {
    try {
      if (editingUser) {
        // 수정
        await userApi.update(editingUser.id, data as UpdateUserDto)
        showSuccess('사용자 정보가 수정되었습니다.')
      } else {
        // 생성
        await userApi.create(data as CreateUserDto)
        showSuccess('사용자가 추가되었습니다.')
      }
      setIsFormOpen(false)
      setEditingUser(undefined)

      // 저장 후 목록 새로고침 (선택은 fetchUsers에서 유지)
      await fetchUsers()
    } catch (error) {
      console.error('저장 오류:', error)
      throw error
    }
  }

  // 검색 처리
  const handleSearch = (searchType: SearchType, searchValue: string) => {
    if (!searchValue.trim()) {
      // 검색어가 없으면 전체 목록 표시
      setUsers(allUsers)
      return
    }

    const filteredUsers = allUsers.filter((user) => {
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
    })

    setUsers(filteredUsers)
    setSelectedUser(null) // 검색 시 선택 해제
  }

  // 테이블 행 클릭 핸들러
  const handleRowClick = (user: User, _index: number) => {
    setSelectedUser(user)
  }

  // 키보드 단축키 처리
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

      // F1: 검색 (기본 동작 차단 및 검색 모달 열기)
      if (e.key === 'F1') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      // F2: 사용자 추가
      else if (e.key === 'F2') {
        e.preventDefault()
        handleAdd()
      }
      // F3: 선택된 사용자 수정
      else if (e.key === 'F3') {
        e.preventDefault()
        if (selectedUser) {
          handleEdit(selectedUser)
        }
      }
      // F4: 선택된 사용자 삭제
      else if (e.key === 'F4') {
        e.preventDefault()
        if (selectedUser) {
          handleDelete(selectedUser)
        }
      }
      // ArrowUp: 위 행 선택
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (users.length > 0) {
          if (selectedUser) {
            const currentIndex = users.findIndex((u) => u.id === selectedUser.id)
            if (currentIndex > 0) {
              setSelectedUser(users[currentIndex - 1])
            }
          } else {
            // 선택된 사용자가 없으면 마지막 행 선택
            setSelectedUser(users[users.length - 1])
          }
        }
      }
      // ArrowDown: 아래 행 선택
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (users.length > 0) {
          if (selectedUser) {
            const currentIndex = users.findIndex((u) => u.id === selectedUser.id)
            if (currentIndex < users.length - 1) {
              setSelectedUser(users[currentIndex + 1])
            }
          } else {
            // 선택된 사용자가 없으면 첫 번째 행 선택
            setSelectedUser(users[0])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFormOpen, isSearchOpen, selectedUser, users])

  const columns: TableColumn<User>[] = [
    { key: 'id', label: 'ID', width: '120px' },
    { key: 'name', label: '사용자명' },
    { key: 'grade', label: '등급' },
    { key: 'department', label: '부서' },
  ]

  return (
    <div className="user-management">
      <ListPageTemplate
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="등록된 사용자가 없습니다."
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
              onClick={() => selectedUser && handleDelete(selectedUser)} 
              type="button" 
              size="small"
              variant="danger"
              disabled={!selectedUser}
              title={!selectedUser ? '행을 선택한 후 삭제할 수 있습니다' : ''}
            >
              <span>F4 삭제</span>
            </Button>
          </div>
        }
        keyExtractor={(user) => user.id}
        onRowClick={handleRowClick}
        selectedRow={selectedUser}
      />

      <UserForm
        user={editingUser}
        isOpen={isFormOpen}
        onSave={handleSave}
        onCancel={() => {
          setIsFormOpen(false)
          setEditingUser(undefined)
        }}
      />

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
    </div>
  )
}

export default UserManagement
