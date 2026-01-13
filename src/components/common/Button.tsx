import { ReactNode, ButtonHTMLAttributes } from 'react'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'warning'
  size?: 'small' | 'medium' | 'large'
  children: ReactNode
}

const Button = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
