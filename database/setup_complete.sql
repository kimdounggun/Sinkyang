-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS sinkyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 선택 (중요!)
USE sinkyang;

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY COMMENT '사용자 ID',
    name VARCHAR(50) NOT NULL COMMENT '사용자명',
    grade VARCHAR(20) NOT NULL COMMENT '등급 (관리자, 일반사용자)',
    department VARCHAR(50) NOT NULL COMMENT '부서',
    email VARCHAR(100) COMMENT '이메일',
    password VARCHAR(255) COMMENT '비밀번호 (해시)',
    phone VARCHAR(20) COMMENT '전화번호',
    status VARCHAR(20) DEFAULT '활성' COMMENT '상태 (활성, 비활성, 휴직)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(20) COMMENT '생성자',
    updated_by VARCHAR(20) COMMENT '수정자',
    INDEX idx_department (department),
    INDEX idx_grade (grade),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 관리 테이블';

-- 기본 데이터 삽입
INSERT INTO users (id, name, grade, department, email, status, created_by) VALUES
('U001', '홍길동', '관리자', '경영지원부', 'hong@example.com', '활성', 'SYSTEM'),
('U002', '김철수', '일반사용자', '생산관리', 'kim@example.com', '활성', 'SYSTEM'),
('U003', '이영희', '일반사용자', '품질관리', 'lee@example.com', '활성', 'SYSTEM'),
('U004', '박민수', '관리자', '구매관리', 'park@example.com', '활성', 'SYSTEM'),
('U005', '정수진', '일반사용자', '영업관리', 'jung@example.com', '활성', 'SYSTEM')
ON DUPLICATE KEY UPDATE name=VALUES(name);
