import { useState, useEffect, useCallback } from 'react'
import { useAlert } from './useAlert'
import { useConfirm } from './useConfirm'

// API 서비스 인터페이스 (제네릭 타입)
export interface ListPageApiService<T, CreateDto, UpdateDto> {
  getAll: (params?: any) => Promise<{ data: T[] }>
  create: (data: CreateDto) => Promise<T>
  update: (id: string, data: UpdateDto) => Promise<T>
  delete: (id: string) => Promise<void>
}

// 검색 필터 함수 타입
export type SearchFilterFn<T> = (item: T, searchType: string, searchValue: string) => boolean

// useListPage 훅 옵션
export interface UseListPageOptions<T, CreateDto, UpdateDto> {
  apiService: ListPageApiService<T, CreateDto, UpdateDto>
  keyExtractor: (item: T) => string | number
  searchFilterFn?: SearchFilterFn<T>
  fetchParams?: any // API getAll에 전달할 기본 파라미터
  getDeleteMessage?: (item: T) => string // 삭제 확인 메시지 생성 함수
  getDeleteTitle?: (item: T) => string // 삭제 확인 제목
  getSuccessMessage?: (action: 'create' | 'update' | 'delete') => string // 성공 메시지
  enableKeyboardShortcuts?: boolean // 키보드 단축키 활성화
}

export const useListPage = <T extends Record<string, any>, CreateDto, UpdateDto>(
  options: UseListPageOptions<T, CreateDto, UpdateDto>
) => {
  const {
    apiService,
    keyExtractor,
    searchFilterFn,
    fetchParams,
    getDeleteMessage,
    getDeleteTitle,
    getSuccessMessage,
    enableKeyboardShortcuts = true,
  } = options

  const [items, setItems] = useState<T[]>([]) // 필터링된 목록
  const [allItems, setAllItems] = useState<T[]>([]) // 전체 목록 (검색용)
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | undefined>(undefined)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const { showSuccess, showError, AlertComponent } = useAlert()
  const { showConfirm, ConfirmComponent } = useConfirm()

  // 데이터 조회
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiService.getAll(fetchParams)
      const itemList = response.data || []
      setAllItems(itemList)
      setItems(itemList)

      // 선택된 항목이 있으면 업데이트된 데이터로 선택 유지
      setSelectedItem((prevSelected) => {
        if (prevSelected) {
          const key = keyExtractor(prevSelected)
          const updatedItem = itemList.find((item) => keyExtractor(item) === key)
          return updatedItem || null
        }
        return null
      })
    } catch (error) {
      setItems([])
      setAllItems([])
      if (!error) return
    } finally {
      setLoading(false)
    }
  }, [apiService, fetchParams, keyExtractor])

  // 초기 데이터 로드
  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 추가
  const handleAdd = useCallback(() => {
    setEditingItem(undefined)
    setIsFormOpen(true)
  }, [])

  // 수정
  const handleEdit = useCallback((item: T) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }, [])

  // 취소 (폼 닫기)
  const handleCancel = useCallback(() => {
    setIsFormOpen(false)
    setEditingItem(undefined)
  }, [])

  // 삭제
  const handleDelete = useCallback(
    (item: T) => {
      const deleteMessage = getDeleteMessage
        ? getDeleteMessage(item)
        : '정말로 삭제하시겠습니까?'
      const deleteTitle = getDeleteTitle ? getDeleteTitle(item) : '삭제 확인'

      showConfirm(
        deleteMessage,
        async () => {
          try {
            const key = keyExtractor(item)
            await apiService.delete(String(key))
            const successMsg = getSuccessMessage
              ? getSuccessMessage('delete')
              : '삭제되었습니다.'
            showSuccess(successMsg)

            setSelectedItem(null)
            fetchItems()
          } catch (error) {
            console.error('삭제 오류:', error)
            showError(
              error instanceof Error
                ? error.message
                : '삭제 중 오류가 발생했습니다.'
            )
          }
        },
        {
          title: deleteTitle,
          type: 'danger',
          confirmText: '삭제',
          cancelText: '취소',
        }
      )
    },
    [
      apiService,
      keyExtractor,
      fetchItems,
      showConfirm,
      showSuccess,
      showError,
      getDeleteMessage,
      getDeleteTitle,
      getSuccessMessage,
    ]
  )

  // 저장
  const handleSave = useCallback(
    async (data: CreateDto | UpdateDto) => {
      try {
        if (editingItem) {
          // 수정
          const key = keyExtractor(editingItem)
          await apiService.update(String(key), data as UpdateDto)
          const successMsg = getSuccessMessage
            ? getSuccessMessage('update')
            : '수정되었습니다.'
          showSuccess(successMsg)
        } else {
          // 생성
          await apiService.create(data as CreateDto)
          const successMsg = getSuccessMessage
            ? getSuccessMessage('create')
            : '추가되었습니다.'
          showSuccess(successMsg)
        }
        setIsFormOpen(false)
        setEditingItem(undefined)
        await fetchItems()
      } catch (error) {
        console.error('저장 오류:', error)
        throw error
      }
    },
    [
      editingItem,
      apiService,
      keyExtractor,
      fetchItems,
      showSuccess,
      getSuccessMessage,
    ]
  )

  // 검색
  const handleSearch = useCallback(
    (searchType: string, searchValue: string) => {
      if (!searchValue.trim()) {
        setItems(allItems)
        return
      }

      if (searchFilterFn) {
        const filteredItems = allItems.filter((item) =>
          searchFilterFn(item, searchType, searchValue)
        )
        setItems(filteredItems)
      } else {
        // 기본 검색 (검색 필터 함수가 없으면 전체 목록 유지)
        setItems(allItems)
      }
      setSelectedItem(null)
    },
    [allItems, searchFilterFn]
  )

  // 행 클릭
  const handleRowClick = useCallback((item: T, _index: number) => {
    setSelectedItem(item)
  }, [])

  // 키보드 단축키 처리
  useEffect(() => {
    if (!enableKeyboardShortcuts) return

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
        if (selectedItem) {
          handleEdit(selectedItem)
        }
      }
      // F4: 삭제
      else if (e.key === 'F4') {
        e.preventDefault()
        if (selectedItem) {
          handleDelete(selectedItem)
        }
      }
      // ArrowUp: 위 행 선택
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (items.length > 0) {
          if (selectedItem) {
            const selectedKey = keyExtractor(selectedItem)
            const currentIndex = items.findIndex(
              (item) => keyExtractor(item) === selectedKey
            )
            if (currentIndex > 0) {
              setSelectedItem(items[currentIndex - 1])
            }
          } else {
            setSelectedItem(items[items.length - 1])
          }
        }
      }
      // ArrowDown: 아래 행 선택
      else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (items.length > 0) {
          if (selectedItem) {
            const selectedKey = keyExtractor(selectedItem)
            const currentIndex = items.findIndex(
              (item) => keyExtractor(item) === selectedKey
            )
            if (currentIndex < items.length - 1) {
              setSelectedItem(items[currentIndex + 1])
            }
          } else {
            setSelectedItem(items[0])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enableKeyboardShortcuts,
    isFormOpen,
    isSearchOpen,
    selectedItem,
    items,
    keyExtractor,
    handleAdd,
    handleEdit,
    handleDelete,
  ])

  return {
    // 상태
    items,
    allItems,
    loading,
    isFormOpen,
    isSearchOpen,
    editingItem,
    selectedItem,

    // 모달 제어
    setIsFormOpen,
    setIsSearchOpen,

    // 핸들러
    handleAdd,
    handleEdit,
    handleDelete,
    handleSave,
    handleCancel,
    handleSearch,
    handleRowClick,
    fetchItems,

    // 컴포넌트
    AlertComponent,
    ConfirmComponent,
  }
}
