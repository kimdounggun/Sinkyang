import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'sinkyang',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Connection pool 생성
const pool = mysql.createPool(dbConfig)

// 연결 테스트
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ 데이터베이스 연결 성공')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error)
    return false
  }
}

export default pool
