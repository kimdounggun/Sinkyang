import { MenuItem, PageConfig } from '../types'
import Dashboard from '../pages/Dashboard'
import UserManagement from '../pages/UserManagement'

// 메뉴 아이템 설정
export const menuItems: MenuItem[] = [
  { path: '/', label: '메뉴', icon: 'dashboard' },
  { path: '/schedule', label: '일정관리', icon: 'calendar_today' },
  { path: '/purchase', label: '구매관리', icon: 'shopping_cart' },
  { path: '/sales', label: '영업관리', icon: 'point_of_sale' },
  { path: '/production', label: '생산관리', icon: 'factory' },
  { path: '/outsourcing', label: '외주관리', icon: 'handshake' },
  { path: '/other-production', label: '타공생산부', icon: 'build' },
  { path: '/inventory', label: '재고관리', icon: 'inventory_2' },
  { path: '/shipping', label: '출고관리', icon: 'local_shipping' },
  { path: '/quality', label: '품질관리', icon: 'verified' },
  { path: '/management-support', label: '경영지원부', icon: 'business_center' },
  { path: '/management-status', label: '경영현황', icon: 'trending_up' },
  { path: '/resource', label: '자원사용관리', icon: 'battery_charging_full' },
  { path: '/assets', label: '자산관리', icon: 'corporate_fare' },
  { path: '/standard', label: '기준관리', icon: 'library_books' },
  { path: '/users', label: '사용자관리', icon: 'people' },
]

// 페이지 설정
export const pages: PageConfig[] = [
  {
    title: 'Dashboard',
    path: '/',
    component: Dashboard,
    menuItem: menuItems[0],
  },
  {
    title: '사용자관리',
    path: '/users',
    component: UserManagement,
    menuItem: menuItems[menuItems.length - 1],
  },
]
