import { TableColumn } from '../types'
import { userApi, User, CreateUserDto, UpdateUserDto } from '../services/api'
import ListPageTemplate from '../templates/ListPageTemplate'
import { Button } from '../components/common'
import UserForm from '../components/UserForm'
import SearchModal from '../components/common/SearchModal'
import { useListPage } from '../hooks/useListPage'
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
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleSearch,
    handleRowClick,
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
  })

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
        onCancel={handleCancel}
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
