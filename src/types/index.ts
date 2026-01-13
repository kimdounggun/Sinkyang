// 공통 타입 정의

export interface TableColumn<T = any> {
  key: string
  label: string
  render?: (value: any, row: T, index: number) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface MenuItem {
  path: string
  label: string
  icon: string
  children?: MenuItem[]
}

export interface PageConfig {
  title: string
  path: string
  component: React.ComponentType
  menuItem?: MenuItem
}

export interface SectionConfig {
  title: string
  showHeader?: boolean
  headerActions?: React.ReactNode
}

export interface KPICardData {
  icon: string
  title: string
  value: string | number
  details?: { label: string; value: string | number }[]
}
