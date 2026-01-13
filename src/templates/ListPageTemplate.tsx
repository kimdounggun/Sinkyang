import { ReactNode } from 'react'
import { TableColumn } from '../types'
import PageHeader from '../components/common/PageHeader'
import Section from '../components/common/Section'
import Table from '../components/common/Table'
import './ListPageTemplate.css'

interface ListPageTemplateProps<T = any> {
  title?: string
  description?: string
  headerActions?: ReactNode
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  loading?: boolean
  sectionTitle?: string
  sectionActions?: ReactNode
  onRowClick?: (row: T, index: number) => void
  keyExtractor?: (row: T, index: number) => string | number
  selectedRow?: T | null
}

const ListPageTemplate = <T,>({
  title,
  description,
  headerActions,
  columns,
  data,
  emptyMessage = '등록된 데이터가 없습니다.',
  loading = false,
  sectionTitle,
  sectionActions,
  onRowClick,
  keyExtractor,
  selectedRow,
}: ListPageTemplateProps<T>) => {
  return (
    <div className="list-page-template">
      {title && (
        <PageHeader
          title={title}
          description={description}
          actions={headerActions}
        />
      )}

      <Section
        title={sectionTitle || (title ? `▲${title} 목록` : undefined)}
        headerActions={sectionActions}
      >
        <Table
          columns={columns}
          data={data}
          emptyMessage={emptyMessage}
          loading={loading}
          onRowClick={onRowClick}
          keyExtractor={keyExtractor}
          selectedRow={selectedRow}
        />
      </Section>
    </div>
  )
}

export default ListPageTemplate
