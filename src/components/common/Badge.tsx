import './Badge.css'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'small' | 'medium'
}

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
}: BadgeProps) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  )
}

export default Badge
