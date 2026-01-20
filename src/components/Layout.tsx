import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuItems } from '../config/routes'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="material-icons logo-icon">cloud</span>
            <span className="company-name">Sinkyang</span>
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <span className="material-icons sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="company-info">
            <strong>DO SOFT</strong>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
