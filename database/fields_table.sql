-- 현장 테이블 생성 SQL
-- 기존 데이터베이스에 fields 테이블을 추가하는 경우 사용

USE sinkyang;

-- 현장 테이블 생성
CREATE TABLE IF NOT EXISTS fields (
    id VARCHAR(20) PRIMARY KEY COMMENT '현장 ID',
    account_id VARCHAR(20) NOT NULL COMMENT '거래처 ID',
    field_name VARCHAR(100) NOT NULL COMMENT '현장명',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(20) COMMENT '생성자',
    updated_by VARCHAR(20) COMMENT '수정자',
    INDEX idx_account_id (account_id),
    INDEX idx_field_name (field_name),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='현장 관리 테이블';
