import { useEffect, useRef } from 'react'

export interface UseListPageHotkeysOptions<T> {
  // 상태
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  isEditMode: boolean
  setIsEditMode: (mode: boolean) => void
  isEditModeRef: React.MutableRefObject<boolean>
  selectedItem: T | null
  items: T[]
  editingItem: T | undefined

  // 핸들러
  handleAdd: () => void
  handleEdit: (item: T) => void
  handleDelete: (item: T) => void
  handleCancel: () => void
  handleRowClick: (item: T, index: number) => void

  // 유틸리티
  keyExtractor: (item: T) => string | number

  // F2 추가 모드 취소 체크 (필드가 비어있는지 확인)
  checkEmptyFields?: () => boolean

  // F4 삭제 처리 (체크된 항목이 있으면 복수 삭제, 없으면 단일 삭제)
  handleDeleteWithChecked?: () => void
}

/**
 * 리스트 페이지의 키보드 단축키를 처리하는 공통 훅
 * F1: 검색, F2: 추가, F3: 수정, F4: 삭제, ArrowUp/Down: 행 선택
 */
export const useListPageHotkeys = <T extends Record<string, any>>(
  options: UseListPageHotkeysOptions<T>
) => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    isEditMode,
    setIsEditMode,
    isEditModeRef,
    selectedItem,
    items,
    editingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCancel,
    handleRowClick,
    keyExtractor,
    checkEmptyFields,
    handleDeleteWithChecked,
  } = options

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
        if (isEditModeRef.current && editingItem === undefined) {
          // checkEmptyFields 함수가 제공되면 사용, 없으면 기본 체크
          const isEmpty = checkEmptyFields ? checkEmptyFields() : false

          if (isEmpty) {
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

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

            return // 이벤트 전파 중단
          }
          // 필드에 값이 있으면 이벤트를 전달하여 Form의 F2 핸들러가 저장 처리
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
              const firstInput = form.querySelector(
                'input:not([type="checkbox"]):not([type="radio"]), textarea'
              ) as HTMLElement
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

        if (selectedItem) {
          if (isEditModeRef.current) {
            // 수정 모드일 때: Form의 F3 핸들러가 처리
            // 여기서는 아무것도 하지 않음 - Form이 처리함
            return
          } else {
            // 수정 모드가 아닐 때: 수정 모드로 전환
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()
            handleEdit(selectedItem)
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
          if (handleDeleteWithChecked) {
            // 체크된 항목 삭제 로직이 있으면 사용
            handleDeleteWithChecked()
          } else if (selectedItem) {
            // 단일 삭제
            handleDelete(selectedItem)
          }
        }, 0)
      }
      // ArrowUp: 위 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowUp' && !isEditModeRef.current) {
        if (isSearchOpen) return

        e.preventDefault()
        e.stopPropagation()
        // 모든 입력 필드에서 포커스 강제 제거
        blurAllInputs()

        if (items.length > 0) {
          if (selectedItem) {
            const selectedKey = keyExtractor(selectedItem)
            const currentIndex = items.findIndex((item) => keyExtractor(item) === selectedKey)
            if (currentIndex > 0) {
              const itemToSelect = items[currentIndex - 1]
              handleRowClick(itemToSelect, currentIndex - 1)
            }
          } else {
            const itemToSelect = items[items.length - 1]
            handleRowClick(itemToSelect, items.length - 1)
          }
        }
      }
      // ArrowDown: 아래 행 선택 (수정 모드가 아닐 때만)
      else if (e.key === 'ArrowDown' && !isEditModeRef.current) {
        if (isSearchOpen) return

        e.preventDefault()
        e.stopPropagation()
        // 모든 입력 필드에서 포커스 강제 제거
        blurAllInputs()

        if (items.length > 0) {
          if (selectedItem) {
            const selectedKey = keyExtractor(selectedItem)
            const currentIndex = items.findIndex((item) => keyExtractor(item) === selectedKey)
            if (currentIndex < items.length - 1) {
              const itemToSelect = items[currentIndex + 1]
              handleRowClick(itemToSelect, currentIndex + 1)
            }
          } else {
            const itemToSelect = items[0]
            handleRowClick(itemToSelect, 0)
          }
        }
      }
    }

    // capture phase에서 먼저 처리하여 Form의 핸들러보다 먼저 실행
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [
    isSearchOpen,
    isEditMode,
    isEditModeRef,
    selectedItem,
    items,
    editingItem,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCancel,
    handleRowClick,
    setIsSearchOpen,
    setIsEditMode,
    keyExtractor,
    checkEmptyFields,
    handleDeleteWithChecked,
  ])
}

// 모든 입력 필드에서 포커스 제거하는 헬퍼 함수
function blurAllInputs() {
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
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      document.activeElement.blur()
    }
  }
}
