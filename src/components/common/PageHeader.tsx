import { ReactNode } from 'react'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
  description?: string
}

const PageHeader = ({ title, actions, description }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}

export default PageHeader
