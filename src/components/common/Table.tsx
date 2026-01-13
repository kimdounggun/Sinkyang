import { TableColumn } from '../../types'
import './Table.css'

interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  loading?: boolean
  onRowClick?: (row: T, index: number) => void
  keyExtractor?: (row: T, index: number) => string | number
  selectedRow?: T | null
  rowKeyExtractor?: (row: T) => string | number
}

const Table = <T,>({
  columns,
  data,
  emptyMessage = '데이터가 없습니다.',
  loading = false,
  onRowClick,
  keyExtractor,
  selectedRow,
}: TableProps<T>) => {
  const getRowKey = (row: T, index: number): string | number => {
    if (keyExtractor) {
      return keyExtractor(row, index)
    }
    // 기본적으로 'id' 속성을 찾거나 인덱스 사용
    return (row as any).id || index
  }

  const isRowSelected = (row: T, index: number): boolean => {
    if (!selectedRow) return false
    if (keyExtractor) {
      const rowKey = keyExtractor(row, index)
      // selectedRow의 인덱스를 찾아서 키 추출
      const selectedIndex = data.findIndex((r) => r === selectedRow)
      if (selectedIndex >= 0) {
        const selectedKey = keyExtractor(selectedRow, selectedIndex)
        return rowKey === selectedKey
      }
    }
    // 기본적으로 'id' 속성으로 비교
    return (row as any).id === (selectedRow as any).id
  }

  if (loading) {
    return (
      <div className="table-container">
        <div className="table-loading">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  width: column.width,
                  textAlign: column.align || 'left',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-row">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={`${onRowClick ? 'clickable-row' : ''} ${isRowSelected(row, rowIndex) ? 'selected-row' : ''}`}
              >
                {columns.map((column) => {
                  const value = (row as any)[column.key]
                  return (
                    <td
                      key={column.key}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : value}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
