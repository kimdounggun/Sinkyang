-- 사용자관리 테이블 생성
-- PostgreSQL

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT '활성',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(20),
    updated_by VARCHAR(20)
);

COMMENT ON TABLE users IS '사용자 관리 테이블';
COMMENT ON COLUMN users.id IS '사용자 ID';
COMMENT ON COLUMN users.name IS '사용자명';
COMMENT ON COLUMN users.grade IS '등급 (관리자, 일반사용자)';
COMMENT ON COLUMN users.department IS '부서';
COMMENT ON COLUMN users.email IS '이메일';
COMMENT ON COLUMN users.password IS '비밀번호 (해시)';
COMMENT ON COLUMN users.phone IS '전화번호';
COMMENT ON COLUMN users.status IS '상태 (활성, 비활성, 휴직)';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_grade ON users(grade);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 기본 데이터 삽입
INSERT INTO users (id, name, grade, department, email, status, created_by) VALUES
('U001', '홍길동', '관리자', '경영지원부', 'hong@example.com', '활성', 'SYSTEM'),
('U002', '김철수', '일반사용자', '생산관리', 'kim@example.com', '활성', 'SYSTEM'),
('U003', '이영희', '일반사용자', '품질관리', 'lee@example.com', '활성', 'SYSTEM'),
('U004', '박민수', '관리자', '구매관리', 'park@example.com', '활성', 'SYSTEM'),
('U005', '정수진', '일반사용자', '영업관리', 'jung@example.com', '활성', 'SYSTEM')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ============================================
-- SELECT 쿼리 (조회)
-- ============================================

-- 1. 전체 사용자 목록 조회
SELECT 
    id,
    name,
    grade,
    department,
    email,
    phone,
    status,
    created_at,
    updated_at
FROM users
WHERE status != '삭제'
ORDER BY created_at DESC;

-- 2. 특정 사용자 상세 조회
SELECT 
    id,
    name,
    grade,
    department,
    email,
    phone,
    status,
    created_at,
    updated_at,
    created_by,
    updated_by
FROM users
WHERE id = $1;

-- 3. 부서별 사용자 조회
SELECT 
    id,
    name,
    grade,
    department,
    email,
    status
FROM users
WHERE department = $1
    AND status = '활성'
ORDER BY name;

-- 4. 등급별 사용자 조회
SELECT 
    id,
    name,
    grade,
    department,
    email,
    status
FROM users
WHERE grade = $1
    AND status = '활성'
ORDER BY department, name;

-- 5. 검색 (이름, 이메일, 부서)
SELECT 
    id,
    name,
    grade,
    department,
    email,
    status
FROM users
WHERE (
    name LIKE '%' || $1 || '%'
    OR email LIKE '%' || $1 || '%'
    OR department LIKE '%' || $1 || '%'
)
AND status != '삭제'
ORDER BY name;

-- 6. 페이징 조회 (페이지네이션)
SELECT 
    id,
    name,
    grade,
    department,
    email,
    status,
    created_at
FROM users
WHERE status != '삭제'
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- 7. 전체 사용자 수 조회 (페이징용)
SELECT COUNT(*) as total
FROM users
WHERE status != '삭제';

-- ============================================
-- INSERT 쿼리 (등록)
-- ============================================

-- 1. 새 사용자 등록
INSERT INTO users (
    id,
    name,
    grade,
    department,
    email,
    phone,
    password,
    status,
    created_by
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, '활성', $8
);

-- ============================================
-- UPDATE 쿼리 (수정)
-- ============================================

-- 1. 사용자 정보 수정
UPDATE users
SET 
    name = $1,
    grade = $2,
    department = $3,
    email = $4,
    phone = $5,
    updated_by = $6
WHERE id = $7;

-- 2. 사용자 상태 변경
UPDATE users
SET 
    status = $1,
    updated_by = $2
WHERE id = $3;

-- 3. 비밀번호 변경
UPDATE users
SET 
    password = $1,
    updated_by = $2
WHERE id = $3;

-- ============================================
-- DELETE 쿼리 (삭제)
-- ============================================

-- 1. 사용자 삭제 (소프트 삭제)
UPDATE users
SET 
    status = '삭제',
    updated_by = $1
WHERE id = $2;

-- ============================================
-- 통계 쿼리
-- ============================================

-- 1. 부서별 사용자 수
SELECT 
    department,
    COUNT(*) as user_count
FROM users
WHERE status = '활성'
GROUP BY department
ORDER BY user_count DESC;

-- 2. 등급별 사용자 수
SELECT 
    grade,
    COUNT(*) as user_count
FROM users
WHERE status = '활성'
GROUP BY grade
ORDER BY user_count DESC;

-- 3. 상태별 사용자 수
SELECT 
    status,
    COUNT(*) as user_count
FROM users
GROUP BY status;

-- 4. 부서별, 등급별 통계
SELECT 
    department,
    grade,
    COUNT(*) as user_count
FROM users
WHERE status = '활성'
GROUP BY department, grade
ORDER BY department, grade;

-- ============================================
-- 유효성 검사 쿼리
-- ============================================

-- 1. ID 중복 확인
SELECT COUNT(*) as count
FROM users
WHERE id = $1;

-- 2. 이메일 중복 확인
SELECT COUNT(*) as count
FROM users
WHERE email = $1
    AND id != $2; -- 수정 시 자기 자신 제외

-- 3. 활성 사용자 여부 확인
SELECT id, name, status
FROM users
WHERE id = $1
    AND status = '활성';
