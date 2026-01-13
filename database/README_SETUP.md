# 데이터베이스 설정 가이드

## 빠른 설정

MySQL에 접속하여 다음 명령을 실행하세요:

```bash
mysql -u root -p1234
```

MySQL 콘솔에서:

```sql
-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS sinkyang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. 데이터베이스 선택
USE sinkyang;

-- 3. SQL 파일 실행 (파일 경로를 확인하세요)
SOURCE database/users.sql;
```

또는 MySQL Workbench나 다른 클라이언트를 사용하여:

1. `database/users.sql` 파일을 열기
2. 전체 내용을 복사
3. MySQL에 연결된 상태에서 실행

## 확인

테이블이 생성되었는지 확인:

```sql
USE sinkyang;
SHOW TABLES;
DESCRIBE users;
SELECT * FROM users;
```

## Windows에서 MySQL 명령줄 사용

1. MySQL이 PATH에 있는 경우:
   ```cmd
   mysql -u root -p1234
   ```

2. MySQL이 PATH에 없는 경우:
   - MySQL 설치 경로로 이동 (예: `C:\Program Files\MySQL\MySQL Server 8.0\bin`)
   - `mysql.exe -u root -p1234` 실행

## 문제 해결

- **접속 실패**: MySQL 서버가 실행 중인지 확인
- **권한 오류**: root 계정 비밀번호 확인
- **한글 깨짐**: `CHARACTER SET utf8mb4` 설정 확인
