import pool, { testConnection } from '../config/database'
import fs from 'fs'
import path from 'path'

const setupDatabase = async () => {
  try {
    // 데이터베이스 연결 테스트
    const connected = await testConnection()
    if (!connected) {
      console.error('데이터베이스 연결에 실패했습니다.')
      process.exit(1)
    }

    // SQL 파일 읽기 (MySQL 버전)
    const sqlFilePath = path.join(__dirname, '../../../database/setup_complete.sql')
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('SQL 파일을 찾을 수 없습니다:', sqlFilePath)
      console.log('수동으로 database/setup_complete.sql 파일을 실행해주세요.')
      process.exit(1)
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf-8')
    
    // SQL 문을 세미콜론으로 분리하고 실행
    // CREATE DATABASE와 USE 문은 이미 연결된 상태에서는 제외
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        const upper = s.toUpperCase()
        return s.length > 0 
          && !s.startsWith('--') 
          && !s.startsWith('/*')
          && !upper.startsWith('CREATE DATABASE')
          && !upper.startsWith('USE ')
      })

    console.log('데이터베이스 스키마를 설정하는 중...')

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.execute(statement)
        } catch (error: any) {
          // 테이블이 이미 존재하거나 다른 오류는 무시
          if (!error.message.includes('already exists') && !error.message.includes('Duplicate')) {
            console.warn('SQL 실행 경고:', error.message)
          }
        }
      }
    }

    console.log('✅ 데이터베이스 설정이 완료되었습니다.')
    process.exit(0)
  } catch (error) {
    console.error('데이터베이스 설정 오류:', error)
    process.exit(1)
  }
}

setupDatabase()
