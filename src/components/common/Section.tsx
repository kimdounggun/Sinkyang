import { ReactNode } from 'react'
import './Section.css'

interface SectionProps {
  title?: string
  children: ReactNode
  headerActions?: ReactNode
  className?: string
}

const Section = ({ title, children, headerActions, className = '' }: SectionProps) => {
  return (
    <div className={`section ${className}`}>
      {(title || headerActions) && (
        <div className="section-header">
          {title && <h2 className="section-title">{title}</h2>}
          {headerActions && <div className="section-actions">{headerActions}</div>}
        </div>
      )}
      <div className="section-content">{children}</div>
    </div>
  )
}

export default Section
