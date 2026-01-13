# 빠른 시작 가이드

## 프로젝트 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 새로운 페이지 만들기 (3단계)

### 1단계: 페이지 컴포넌트 생성

`src/pages/NewPage.tsx` 파일 생성:

```tsx
import { useState } from 'react'
import { TableColumn } from '../types'
import ListPageTemplate from '../templates/ListPageTemplate'
import { Button } from '../components/common'

interface DataType {
  id: string
  name: string
}

const NewPage = () => {
  const [data] = useState<DataType[]>([
    { id: '1', name: '데이터1' },
  ])

  const columns: TableColumn<DataType>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '이름' },
  ]

  return (
    <ListPageTemplate
      title="새 페이지"
      columns={columns}
      data={data}
      sectionTitle="▲데이터 목록"
    />
  )
}

export default NewPage
```

### 2단계: 라우트 설정

`src/config/routes.ts` 파일에 추가:

```tsx
import NewPage from '../pages/NewPage'

// menuItems 배열에 추가
{ path: '/new-page', label: '새 페이지', icon: '📄' },

// pages 배열에 추가
{
  title: '새 페이지',
  path: '/new-page',
  component: NewPage,
  menuItem: menuItems.find(item => item.path === '/new-page'),
},
```

### 3단계: 완료!

이제 사이드바에 메뉴가 나타나고 페이지가 작동합니다.

## 주요 컴포넌트

- **ListPageTemplate**: 리스트 페이지용 템플릿
- **Table**: 데이터 테이블
- **Button**: 버튼 (primary, secondary, danger, outline)
- **Badge**: 배지 (primary, success, warning, danger, info)
- **Section**: 섹션 컨테이너
- **PageHeader**: 페이지 헤더

자세한 사용법은 `TEMPLATE_GUIDE.md`를 참고하세요.
