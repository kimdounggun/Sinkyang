import { useState, useEffect, useRef } from 'react'
import Button from './Button'
import './SearchModal.css'

export type SearchType = 'name' | 'department' | 'id'

interface SearchModalProps {
  isOpen: boolean
  onSearch: (searchType: SearchType, searchValue: string) => void
  onClose: () => void
  searchTypes?: { value: SearchType; label: string }[]
  defaultSearchType?: SearchType
}

const defaultSearchTypes = [
  { value: 'name' as SearchType, label: '사용자명' },
  { value: 'department' as SearchType, label: '부서' },
  { value: 'id' as SearchType, label: 'ID' },
]

const SearchModal = ({
  isOpen,
  onSearch,
  onClose,
  searchTypes = defaultSearchTypes,
  defaultSearchType = 'name',
}: SearchModalProps) => {
  const [searchType, setSearchType] = useState<SearchType>(defaultSearchType)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isOpen) {
      setSearchValue('')
      setSearchType(defaultSearchType)
      // 모달이 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, defaultSearchType])

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      const handleEnter = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && e.target === inputRef.current) {
          handleSearch()
        }
      }
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleEnter)
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleEnter)
      }
    }
  }, [isOpen, onClose, searchType, searchValue])

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

  const handleSearch = () => {
    onSearch(searchType, searchValue)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: position.x !== 0 || position.y !== 0 ? `translate(${position.x}px, ${position.y}px)` : undefined,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div
          ref={headerRef}
          className="search-modal-header search-modal-drag-handle"
          onMouseDown={handleMouseDown}
        >
          <h2 className="search-modal-title">검색</h2>
          <button className="search-modal-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="search-modal-body">
          <div className="search-type-group">
            <label className="search-type-label">검색구분</label>
            <div className="search-type-options">
              {searchTypes.map((type) => (
                <label key={type.value} className="search-type-option">
                  <input
                    type="radio"
                    name="searchType"
                    value={type.value}
                    checked={searchType === type.value}
                    onChange={(e) => setSearchType(e.target.value as SearchType)}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="search-input-group">
            <label className="search-input-label">검색명</label>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="검색어를 입력하세요"
            />
          </div>
        </div>

        <div className="search-modal-footer">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSearch}>
            검색
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
