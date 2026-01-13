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
        <div className="header-center">
          <nav className="header-nav">
            <button className="nav-btn">
              <span className="material-icons">notifications</span>
              <span>알림</span>
            </button>
            <button className="nav-btn">
              <span className="material-icons">list</span>
              <span>목록</span>
            </button>
            <button className="nav-btn">
              <span className="material-icons">send</span>
              <span>전송</span>
            </button>
            <button className="nav-btn">
              <span className="material-icons">settings</span>
              <span>설정</span>
            </button>
          </nav>
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
