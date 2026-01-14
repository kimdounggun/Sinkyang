import { MenuItem, PageConfig } from '../types'
import UserManagement from '../pages/UserManagement'
import AccountManagement from '../pages/AccountManagement'

// 메뉴 아이템 설정
export const menuItems: MenuItem[] = [
  { path: '/users', label: '사용자관리', icon: 'people' },
  { path: '/accounts', label: '매출거래처', icon: 'business' },
]

// 페이지 설정
export const pages: PageConfig[] = [
  {
    title: '사용자관리',
    path: '/users',
    component: UserManagement,
    menuItem: menuItems[0],
  },
  {
    title: '매출거래처',
    path: '/accounts',
    component: AccountManagement,
    menuItem: menuItems[1],
  },
]
