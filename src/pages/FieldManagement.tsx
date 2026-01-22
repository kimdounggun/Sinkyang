import { useState, useEffect, useRef } from 'react'
import { TableColumn } from '../types'
import { fieldApi, Field, CreateFieldDto, UpdateFieldDto } from '../services/api'
import { Button, Section, Table } from '../components/common'
import FieldForm from '../components/FieldForm'
import SearchModal from '../components/common/SearchModal'
import { useListPage } from '../hooks/useListPage'
import { useConfirm } from '../hooks/useConfirm'
import { useListPageHotkeys } from '../hooks/useListPageHotkeys'
import './FieldManagement.css'

// 검색 필터 함수 (통합 검색: 모든 필드에서 검색)
const fieldSearchFilter = (field: Field, searchValue: string): boolean => {
  const value = searchValue.toLowerCase().trim()
  if (!value) return true
  
  // 모든 필드를 통합 검색
  return (
    field.id?.toLowerCase().includes(value) ||
    field.accountId?.toLowerCase().includes(value) ||
    field.accountName?.toLowerCase().includes(value) ||
    field.fieldName?.toLowerCase().includes(value) ||
    false
  )
}

const FieldManagement = () => {
  const {
    items: fields,
    loading,
    isFormOpen,
    isSearchOpen,
    editingItem: editingField,
    selectedItem: selectedField,
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
  } = useListPage<Field, CreateFieldDto, UpdateFieldDto>({
    apiService: fieldApi,
    keyExtractor: (field) => field.id,
    searchFilterFn: fieldSearchFilter,
    getDeleteMessage: (field) => `정말로 "${field.fieldName}" 현장을 삭제하시겠습니까?`,
    getDeleteTitle: () => '현장 삭제',
    getSuccessMessage: (action) => {
      switch (action) {
        case 'create':
          return '현장이 추가되었습니다.'
        case 'update':
          return '현장 정보가 수정되었습니다.'
        case 'delete':
          return '현장이 삭제되었습니다.'
      }
    },
    enableKeyboardShortcuts: false, // F4 키는 FieldManagement에서 직접 처리
  })

  const { showConfirm: showConfirmChecked } = useConfirm()

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
  }, [selectedField])

  // 수정 모드가 끝날 때 입력 필드 포커스 제거 (방향키 작동을 위해)
  useEffect(() => {
    if (!isEditMode) {
      // 약간의 지연을 두어 상태 업데이트 후 포커스 제거
      const timeoutId = setTimeout(() => {
        const form = document.querySelector('.inline-form-content')
        if (form) {
          const inputs = form.querySelectorAll('input, textarea, select')
          inputs.forEach((input) => {
            if (input instanceof HTMLElement && document.activeElement === input) {
              input.blur()
            }
          })
        }
      }, 50)
      return () => clearTimeout(timeoutId)
    }
  }, [isEditMode])

  // 체크박스 상태 관리
  const [checkedFields, setCheckedFields] = useState<Set<string>>(new Set())

  const handleCheckboxChange = (fieldId: string, checked: boolean) => {
    setCheckedFields((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(fieldId)
      } else {
        newSet.delete(fieldId)
      }
      return newSet
    })
  }

  // 체크된 항목 삭제
  const handleDeleteChecked = () => {
    if (checkedFields.size === 0) return

    const fieldNames = Array.from(checkedFields)
      .map((id) => {
        const field = fields.find((f) => f.id === id)
        return field?.fieldName || id
      })
      .join(', ')

    showConfirmChecked(
      `정말로 선택한 ${checkedFields.size}개의 현장을 삭제하시겠습니까?\n\n${fieldNames}`,
      async () => {
        try {
          await Promise.all(Array.from(checkedFields).map((id) => fieldApi.delete(id)))
          setCheckedFields(new Set())
          fetchItems()
        } catch (error) {
          console.error('삭제 오류:', error)
        }
      },
      {
        title: '현장 삭제',
        type: 'danger',
        confirmText: '삭제',
        cancelText: '취소',
      }
    )
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
    selectedItem: selectedField,
    items: fields,
    editingItem: editingField,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCancel,
    handleRowClick,
    keyExtractor: (field) => field.id,
    checkEmptyFields,
    handleDeleteWithChecked: () => {
      if (checkedFields.size > 0) {
        handleDeleteChecked()
      } else if (selectedField) {
        handleDelete(selectedField)
      }
    },
  })

  const columns: TableColumn<Field>[] = [
    {
      key: 'pr',
      label: 'PR',
      width: '50px',
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={checkedFields.has(row.id)}
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
    { 
      key: 'accountName', 
      label: '거래처',
      render: (_value, row) => row.accountName || row.accountId || ''
    },
    { key: 'fieldName', label: '현장' },
  ]

  return (
    <div className="field-management">
      {/* 상단 버튼들 */}
      <div className="field-page-header">
        <div className="section-actions">
          <Button 
            onClick={() => setIsSearchOpen(true)} 
            type="button" 
            size="small"
            variant="outline"
          >
            <span>F1 검색</span>
          </Button>
          <Button 
            onClick={() => {
              // 추가 모드이고 편집 중일 때: 필드가 모두 비어있으면 취소
              if (isEditMode && editingField === undefined) {
                const isEmpty = checkEmptyFields()
                if (isEmpty) {
                  setIsEditMode(false)
                  isEditModeRef.current = false
                  handleCancel()
                  
                  // 포커스 제거
                  const form = document.querySelector('.inline-form-content')
                  if (form) {
                    const inputs = form.querySelectorAll(
                      'input:not([type="checkbox"]):not([type="radio"]), textarea'
                    ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
                    inputs.forEach((input) => {
                      if (input instanceof HTMLElement) {
                        input.blur()
                      }
                    })
                  }
                  
                  // 테이블에 포커스
                  setTimeout(() => {
                    const table = document.querySelector('.data-table')
                    if (table) {
                      ;(table as HTMLElement).focus()
                    } else {
                      document.body.focus()
                    }
                  }, 50)
                  return
                }
              }
              
              // 추가 모드로 진입
              handleAdd()
              setIsEditMode(true)
              isEditModeRef.current = true
              setTimeout(() => {
                const form = document.querySelector('.inline-form-content')
                if (form) {
                  const firstInput = form.querySelector(
                    'input:not([type="checkbox"]):not([type="radio"]), textarea, select'
                  ) as HTMLElement
                  if (firstInput) {
                    firstInput.focus()
                  }
                }
              }, 50)
            }} 
            type="button" 
            size="small"
          >
            <span>F2 추가</span>
          </Button>
          <Button 
            onClick={() => {
              if (selectedField) {
                if (isEditMode && editingField) {
                  // 수정 모드일 때: 취소 (원래 데이터로 되돌림)
                  setIsEditMode(false)
                  isEditModeRef.current = false
                  handleCancel()
                  
                  // 포커스 제거
                  const form = document.querySelector('.inline-form-content')
                  if (form) {
                    const inputs = form.querySelectorAll(
                      'input:not([type="checkbox"]):not([type="radio"]), textarea'
                    ) as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
                    inputs.forEach((input) => {
                      if (input instanceof HTMLElement) {
                        input.blur()
                      }
                    })
                  }
                  
                  // 테이블에 포커스
                  setTimeout(() => {
                    const table = document.querySelector('.data-table')
                    if (table) {
                      ;(table as HTMLElement).focus()
                    } else {
                      document.body.focus()
                    }
                  }, 50)
                } else {
                  // 수정 모드로 전환
                  handleEdit(selectedField)
                  setIsEditMode(true)
                  isEditModeRef.current = true
                }
              }
            }} 
            type="button" 
            size="small"
            variant="warning"
            disabled={!selectedField}
            title={!selectedField ? '행을 선택한 후 수정할 수 있습니다' : ''}
          >
            <span>F3 수정</span>
          </Button>
          <Button 
            onClick={() => {
              if (checkedFields.size > 0) {
                handleDeleteChecked()
              } else if (selectedField) {
                handleDelete(selectedField)
              }
            }}
            type="button" 
            size="small"
            variant="danger"
            disabled={!selectedField && checkedFields.size === 0}
            title={
              checkedFields.size > 0
                ? `선택한 ${checkedFields.size}개 항목 삭제`
                : !selectedField
                ? '행을 선택한 후 삭제할 수 있습니다'
                : ''
            }
          >
            <span>F4 삭제{checkedFields.size > 0 ? ` (${checkedFields.size})` : ''}</span>
          </Button>
        </div>
      </div>

      {/* 중간 입력 폼 */}
      <FieldForm
        field={isEditMode && editingField ? editingField : (!isEditMode && selectedField ? selectedField : undefined)}
        isOpen={true}
        isEditMode={isEditMode}
        onSave={async (data) => {
          try {
            isSavingRef.current = true
            await handleSave(data)
            
            // 저장 후 수정 모드 해제 (editingField는 handleSave에서 업데이트되지만, isEditMode가 false이면 무시됨)
            isEditModeRef.current = false
            setIsEditMode(false)
            
            // editingField를 초기화하기 위해 handleCancel 호출
            handleCancel()
            // 인라인 폼이므로 isFormOpen을 다시 true로 설정 (handleCancel이 false로 만듦)
            setTimeout(() => {
              setIsFormOpen(true)
            }, 0)
            
            // 약간의 지연 후 저장 플래그 해제 및 포커스 제거
            setTimeout(() => {
              isSavingRef.current = false
              const form = document.querySelector('.inline-form-content')
              if (form) {
                const inputs = form.querySelectorAll('input, textarea, select')
                inputs.forEach((input) => {
                  if (input instanceof HTMLElement) {
                    input.blur()
                  }
                })
              }
            }, 100)
          } catch (error) {
            isSavingRef.current = false
            console.error('저장 오류:', error)
          }
        }}
        onCancel={handleCancel}
      />

      {/* 하단 테이블 */}
      <Section>
        <Table
          columns={columns}
          data={fields}
          loading={loading}
          selectedRow={selectedField}
          onRowClick={handleRowClick}
          keyExtractor={(field) => field.id}
        />
      </Section>

      {/* 검색 모달 */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
        placeholder="거래처, 현장명으로 검색..."
      />

      <AlertComponent />
      <ConfirmComponent />
    </div>
  )
}

export default FieldManagement
