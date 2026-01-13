import { MenuItem, PageConfig } from '../types'
import UserManagement from '../pages/UserManagement'

// 메뉴 아이템 설정
export const menuItems: MenuItem[] = [
  { path: '/users', label: '사용자관리', icon: 'people' },
]

// 페이지 설정
export const pages: PageConfig[] = [
  {
    title: '사용자관리',
    path: '/users',
    component: UserManagement,
    menuItem: menuItems[0],
  },
]
