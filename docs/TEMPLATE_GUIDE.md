# 템플릿 사용 가이드

이 프로젝트는 재사용 가능한 컴포넌트와 템플릿을 사용하여 유지보수가 쉽도록 구성되어 있습니다.

## 프로젝트 구조

```
src/
├── components/
│   ├── common/          # 재사용 가능한 공통 컴포넌트
│   │   ├── Table.tsx
│   │   ├── Section.tsx
│   │   ├── PageHeader.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   └── Layout.tsx       # 메인 레이아웃
├── templates/           # 페이지 템플릿
│   └── ListPageTemplate.tsx
├── pages/               # 실제 페이지 컴포넌트
│   ├── Dashboard.tsx
│   └── UserManagement.tsx
├── config/              # 설정 파일
│   └── routes.ts        # 라우트 및 메뉴 설정
├── types/               # TypeScript 타입 정의
│   └── index.ts
└── styles/              # 공통 스타일
    └── common.css
```

## 새로운 페이지 추가하기

### 1. 리스트 페이지 생성 예시

새로운 리스트 페이지를 만들려면 `ListPageTemplate`을 사용하세요:

```tsx
import { useState } from 'react'
import { TableColumn } from '../types'
import ListPageTemplate from '../templates/ListPageTemplate'
import { Button, Badge } from '../components/common'

// 데이터 타입 정의
interface Product {
  id: string
  name: string
  category: string
  price: number
  status: string
}

const ProductManagement = () => {
  const [products] = useState<Product[]>([
    { id: 'P001', name: '상품1', category: '전자제품', price: 10000, status: '판매중' },
    { id: 'P002', name: '상품2', category: '의류', price: 20000, status: '품절' },
  ])

  // 테이블 컬럼 정의
  const columns: TableColumn<Product>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '상품명' },
    { key: 'category', label: '카테고리' },
    {
      key: 'price',
      label: '가격',
      render: (value: number) => `${value.toLocaleString()}원`,
      align: 'right',
    },
    {
      key: 'status',
      label: '상태',
      render: (value: string) => (
        <Badge variant={value === '판매중' ? 'success' : 'warning'}>
          {value}
        </Badge>
      ),
    },
  ]

  const handleAdd = () => {
    console.log('상품 추가')
  }

  return (
    <ListPageTemplate
      title="상품관리"
      columns={columns}
      data={products}
      emptyMessage="등록된 상품이 없습니다."
      sectionTitle="▲상품 목록"
      headerActions={<Button onClick={handleAdd}>상품 추가</Button>}
      sectionActions={<Button onClick={handleAdd}>상품 추가</Button>}
      keyExtractor={(product) => product.id}
    />
  )
}

export default ProductManagement
```

### 2. 라우트 설정 추가

`src/config/routes.ts`에 새 페이지를 추가:

```tsx
import ProductManagement from '../pages/ProductManagement'

export const menuItems: MenuItem[] = [
  // ... 기존 메뉴
  { path: '/products', label: '상품관리', icon: '📦' },
]

export const pages: PageConfig[] = [
  // ... 기존 페이지
  {
    title: '상품관리',
    path: '/products',
    component: ProductManagement,
    menuItem: menuItems.find(item => item.path === '/products'),
  },
]
```

## 공통 컴포넌트 사용법

### Table 컴포넌트

```tsx
import { Table } from '../components/common'
import { TableColumn } from '../types'

const columns: TableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: '이름' },
  {
    key: 'status',
    label: '상태',
    render: (value) => <Badge>{value}</Badge>,
  },
]

<Table
  columns={columns}
  data={data}
  emptyMessage="데이터가 없습니다."
  loading={false}
  onRowClick={(row, index) => console.log(row)}
  keyExtractor={(row) => row.id}
/>
```

### Button 컴포넌트

```tsx
import { Button } from '../components/common'

<Button variant="primary" size="medium" onClick={handleClick}>
  클릭
</Button>
```

### Badge 컴포넌트

```tsx
import { Badge } from '../components/common'

<Badge variant="primary" size="medium">관리자</Badge>
```

### Section 컴포넌트

```tsx
import { Section } from '../components/common'

<Section
  title="섹션 제목"
  headerActions={<Button>액션</Button>}
>
  내용
</Section>
```

### PageHeader 컴포넌트

```tsx
import { PageHeader } from '../components/common'

<PageHeader
  title="페이지 제목"
  description="페이지 설명"
  actions={<Button>액션</Button>}
/>
```

## 커스텀 렌더링

테이블 컬럼에서 커스텀 렌더링을 사용할 수 있습니다:

```tsx
const columns: TableColumn<Product>[] = [
  {
    key: 'price',
    label: '가격',
    render: (value: number, row: Product, index: number) => {
      return (
        <div>
          <span>{value.toLocaleString()}원</span>
          {row.discount > 0 && (
            <Badge variant="warning">할인</Badge>
          )}
        </div>
      )
    },
  },
]
```

## 유지보수 팁

1. **타입 정의**: 새로운 데이터 타입은 `src/types/index.ts`에 추가
2. **공통 컴포넌트**: 재사용되는 컴포넌트는 `src/components/common/`에 추가
3. **설정 관리**: 메뉴와 라우트는 `src/config/routes.ts`에서 중앙 관리
4. **스타일**: 공통 스타일은 CSS 변수로 `src/styles/common.css`에 정의
5. **템플릿 확장**: 필요시 새로운 템플릿을 `src/templates/`에 추가
