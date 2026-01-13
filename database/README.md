# 데이터베이스 스키마 및 쿼리

사용자관리 모듈을 위한 데이터베이스 스키마와 쿼리문입니다.

## 파일 설명

- `users.sql`: MySQL/MariaDB용 스키마 및 쿼리
- `users_postgresql.sql`: PostgreSQL용 스키마 및 쿼리

## 테이블 구조

### users 테이블

| 컬럼명 | 타입 | 설명 | 필수 |
|--------|------|------|------|
| id | VARCHAR(20) | 사용자 ID (PK) | ✅ |
| name | VARCHAR(50) | 사용자명 | ✅ |
| grade | VARCHAR(20) | 등급 (관리자, 일반사용자) | ✅ |
| department | VARCHAR(50) | 부서 | ✅ |
| email | VARCHAR(100) | 이메일 | |
| password | VARCHAR(255) | 비밀번호 (해시) | |
| phone | VARCHAR(20) | 전화번호 | |
| status | VARCHAR(20) | 상태 (활성, 비활성, 휴직, 삭제) | |
| created_at | DATETIME | 생성일시 | |
| updated_at | DATETIME | 수정일시 | |
| created_by | VARCHAR(20) | 생성자 | |
| updated_by | VARCHAR(20) | 수정자 | |

## 주요 쿼리

### 1. 조회 (SELECT)

```sql
-- 전체 사용자 목록
SELECT id, name, grade, department, email, status 
FROM users 
WHERE status != '삭제' 
ORDER BY created_at DESC;

-- 특정 사용자 조회
SELECT * FROM users WHERE id = ?;

-- 부서별 조회
SELECT * FROM users WHERE department = ? AND status = '활성';

-- 검색
SELECT * FROM users 
WHERE (name LIKE '%?%' OR email LIKE '%?%' OR department LIKE '%?%')
AND status != '삭제';
```

### 2. 등록 (INSERT)

```sql
INSERT INTO users (id, name, grade, department, email, phone, password, created_by)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
```

### 3. 수정 (UPDATE)

```sql
UPDATE users 
SET name = ?, grade = ?, department = ?, email = ?, phone = ?, updated_by = ?
WHERE id = ?;
```

### 4. 삭제 (소프트 삭제 권장)

```sql
UPDATE users 
SET status = '삭제', updated_by = ?
WHERE id = ?;
```

## 사용 예시

### Node.js (MySQL)

```javascript
// 전체 목록 조회
const [users] = await db.query(
  'SELECT id, name, grade, department, email, status FROM users WHERE status != ? ORDER BY created_at DESC',
  ['삭제']
);

// 사용자 등록
await db.query(
  'INSERT INTO users (id, name, grade, department, email, created_by) VALUES (?, ?, ?, ?, ?, ?)',
  [id, name, grade, department, email, currentUserId]
);

// 사용자 수정
await db.query(
  'UPDATE users SET name = ?, grade = ?, department = ?, email = ?, updated_by = ? WHERE id = ?',
  [name, grade, department, email, currentUserId, id]
);

// 사용자 삭제 (소프트)
await db.query(
  'UPDATE users SET status = ?, updated_by = ? WHERE id = ?',
  ['삭제', currentUserId, id]
);
```

### Node.js (PostgreSQL)

```javascript
// PostgreSQL은 $1, $2 방식 사용
const result = await db.query(
  'SELECT id, name, grade, department, email, status FROM users WHERE status != $1 ORDER BY created_at DESC',
  ['삭제']
);

await db.query(
  'INSERT INTO users (id, name, grade, department, email, created_by) VALUES ($1, $2, $3, $4, $5, $6)',
  [id, name, grade, department, email, currentUserId]
);
```

## 인덱스

성능 최적화를 위한 인덱스:

- `idx_department`: 부서별 조회
- `idx_grade`: 등급별 조회  
- `idx_status`: 상태별 조회

## 주의사항

1. **소프트 삭제**: 실제 DELETE 대신 status를 '삭제'로 변경하는 것을 권장합니다.
2. **비밀번호**: password는 해시된 값을 저장해야 합니다. (bcrypt, argon2 등)
3. **ID 생성**: 사용자 ID는 고유한 값이어야 하며, UUID 또는 규칙 기반 생성이 가능합니다.
4. **트랜잭션**: 중요한 작업은 트랜잭션으로 처리하는 것을 권장합니다.
5. **파라미터 바인딩**: SQL 인젝션 방지를 위해 항상 파라미터 바인딩을 사용하세요.
