# Sinkyang Backend API

ERP 시스템 백엔드 API 서버입니다.

## 기술 스택

- Node.js
- Express
- TypeScript
- MySQL (mysql2)

## 설치 및 실행

### 1. 의존성 설치

```bash
cd backend
npm install
```

### 2. 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요시 수정하세요:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=sinkyang

PORT=3000
NODE_ENV=development
```

### 3. 데이터베이스 설정

MySQL에 `sinkyang` 데이터베이스를 생성하고, `database/users.sql` 파일을 실행하세요:

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS sinkyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# SQL 파일 실행
USE sinkyang;
SOURCE database/users.sql;
```

또는 자동 설정:

```bash
npm run db:setup
```

### 4. 서버 실행

```bash
# 개발 모드 (자동 재시작)
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

서버가 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 사용자 관리 API

#### 1. 전체 사용자 목록 조회

```
GET /api/users
```

**Query Parameters:**
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 100)
- `search` (optional): 검색어 (이름, 이메일, 부서)
- `department` (optional): 부서 필터
- `grade` (optional): 등급 필터
- `status` (optional): 상태 필터 (기본값: '활성')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "U001",
      "name": "홍길동",
      "grade": "관리자",
      "department": "경영지원부",
      "email": "hong@example.com",
      "phone": null,
      "status": "활성",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 5,
    "totalPages": 1
  }
}
```

#### 2. 특정 사용자 조회

```
GET /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "U001",
    "name": "홍길동",
    "grade": "관리자",
    "department": "경영지원부",
    "email": "hong@example.com",
    "phone": null,
    "status": "활성",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 3. 사용자 생성

```
POST /api/users
```

**Request Body:**
```json
{
  "id": "U006",
  "name": "김영수",
  "grade": "일반사용자",
  "department": "생산관리",
  "email": "kim@example.com",
  "phone": "010-1234-5678",
  "password": "hashed_password",
  "created_by": "U001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "사용자가 성공적으로 생성되었습니다.",
  "data": { ... }
}
```

#### 4. 사용자 수정

```
PUT /api/users/:id
```

**Request Body:**
```json
{
  "name": "김영수",
  "grade": "관리자",
  "department": "경영지원부",
  "email": "kim@example.com",
  "phone": "010-1234-5678",
  "updated_by": "U001"
}
```

#### 5. 사용자 삭제 (소프트 삭제)

```
DELETE /api/users/:id
```

**Response:**
```json
{
  "success": true,
  "message": "사용자가 성공적으로 삭제되었습니다."
}
```

## 프로젝트 구조

```
backend/
├── src/
│   ├── config/          # 설정 파일
│   │   └── database.ts  # 데이터베이스 연결
│   ├── controllers/     # 컨트롤러
│   │   └── user.controller.ts
│   ├── models/          # 데이터 모델
│   │   └── user.model.ts
│   ├── routes/          # 라우트
│   │   └── user.routes.ts
│   ├── types/           # TypeScript 타입
│   │   └── user.ts
│   └── index.ts         # 서버 진입점
├── dist/                # 빌드 출력 (자동 생성)
├── .env                 # 환경 변수
├── package.json
└── tsconfig.json
```
