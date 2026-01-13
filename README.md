# Sinkyang ERP 시스템

재사용 가능한 템플릿 기반의 ERP 시스템 프론트엔드 프로젝트입니다.

## 🚀 빠른 시작

### 사전 준비

1. MySQL 데이터베이스 생성:
```bash
mysql -u root -p1234
CREATE DATABASE IF NOT EXISTS sinkyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sinkyang;
SOURCE database/users.sql;
```

2. 백엔드 의존성 설치:
```bash
cd backend
npm install
cd ..
```

### 실행

```bash
# 루트 디렉토리에서 의존성 설치 (처음 한 번만)
npm install

# 프론트엔드와 백엔드 동시 실행
npm run dev
```

서버가 실행됩니다:
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000

개별 실행:
```bash
npm run dev:frontend  # 프론트엔드만
npm run dev:backend   # 백엔드만
```

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── common/          # 재사용 가능한 공통 컴포넌트
│   │   ├── Table.tsx    # 데이터 테이블
│   │   ├── Section.tsx  # 섹션 컨테이너
│   │   ├── PageHeader.tsx
│   │   ├── Button.tsx
│   │   └── Badge.tsx
│   └── Layout.tsx       # 메인 레이아웃
├── templates/           # 페이지 템플릿
│   └── ListPageTemplate.tsx
├── pages/               # 실제 페이지 컴포넌트
├── config/              # 설정 파일 (라우트, 메뉴)
├── types/               # TypeScript 타입 정의
└── styles/              # 공통 스타일
```

## ✨ 주요 특징

- **템플릿 기반**: 재사용 가능한 페이지 템플릿으로 빠른 개발
- **타입 안정성**: TypeScript로 타입 안전성 보장
- **모듈화**: 공통 컴포넌트로 코드 재사용성 극대화
- **설정 중심**: 라우트와 메뉴를 설정 파일로 중앙 관리
- **유지보수성**: 명확한 구조로 쉬운 유지보수

## 📚 문서

- [빠른 시작 가이드](./docs/QUICK_START.md) - 3단계로 새 페이지 만들기
- [템플릿 사용 가이드](./docs/TEMPLATE_GUIDE.md) - 상세한 컴포넌트 사용법

## 🛠️ 주요 기능

- ✅ Dashboard: 대시보드 페이지
- ✅ 사용자관리: 사용자 목록 관리 (ID, 사용자명, 등급, 부서)
- ✅ 템플릿 시스템: ListPageTemplate으로 빠른 페이지 생성

## 🎯 새 페이지 추가하기

```bash
# 1. 페이지 컴포넌트 생성
# src/pages/NewPage.tsx

# 2. 라우트 설정에 추가
# src/config/routes.ts

# 완료! 자동으로 메뉴에 추가됨
```

자세한 내용은 [빠른 시작 가이드](./docs/QUICK_START.md)를 참고하세요.
