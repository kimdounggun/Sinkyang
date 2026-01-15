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

-- 거래처 테이블 생성
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(20) PRIMARY KEY COMMENT '거래처 ID',
    name VARCHAR(100) NOT NULL COMMENT '거래처명',
    print_name VARCHAR(100) COMMENT '출력명',
    registration_number VARCHAR(50) COMMENT '등록번호',
    representative VARCHAR(50) COMMENT '대표자',
    resident_registration_number VARCHAR(20) COMMENT '주민번호',
    phone VARCHAR(20) COMMENT '전화번호',
    fax VARCHAR(20) COMMENT 'FAX',
    address VARCHAR(255) COMMENT '주소',
    postal_code VARCHAR(20) COMMENT '우편번호',
    business_type VARCHAR(50) COMMENT '업태',
    business_category VARCHAR(50) COMMENT '업종',
    electronic_invoice_input VARCHAR(255) COMMENT '전자계산서 입력항목',
    email VARCHAR(100) COMMENT 'E-mail',
    collection_date VARCHAR(20) COMMENT '수금일',
    remarks TEXT COMMENT '비고',
    closing_date VARCHAR(20) COMMENT '마감일',
    invoice VARCHAR(20) COMMENT '계산서',
    contact_person VARCHAR(50) COMMENT '담당자',
    contact_person_phone VARCHAR(20) COMMENT '담당자 전화번호',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(20) COMMENT '생성자',
    updated_by VARCHAR(20) COMMENT '수정자',
    INDEX idx_name (name),
    INDEX idx_business_type (business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='거래처 관리 테이블';

-- 매입거래처 테이블 생성
CREATE TABLE IF NOT EXISTS purchase_accounts (
    id VARCHAR(20) PRIMARY KEY COMMENT '거래처 ID',
    name VARCHAR(100) NOT NULL COMMENT '거래처명',
    print_name VARCHAR(100) COMMENT '출력명',
    representative VARCHAR(50) COMMENT '대표자',
    address VARCHAR(255) COMMENT '주소',
    postal_code VARCHAR(20) COMMENT '우편번호',
    phone VARCHAR(20) COMMENT '전화번호',
    registration_number VARCHAR(50) COMMENT '등록번호',
    fax VARCHAR(20) COMMENT 'FAX',
    business_type VARCHAR(50) COMMENT '업태',
    business_category VARCHAR(50) COMMENT '종목',
    remarks TEXT COMMENT '비고',
    deposit_account VARCHAR(100) COMMENT '입금계좌',
    payment_date VARCHAR(20) COMMENT '지불일',
    closing_date VARCHAR(20) COMMENT '마감일',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    created_by VARCHAR(20) COMMENT '생성자',
    updated_by VARCHAR(20) COMMENT '수정자',
    INDEX idx_name (name),
    INDEX idx_business_type (business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='매입거래처 관리 테이블';


