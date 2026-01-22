import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { testConnection } from './config/database'
import userRoutes from './routes/user.routes'
import accountRoutes from './routes/account.routes'
import purchaseAccountRoutes from './routes/purchaseAccount.routes'
import fieldRoutes from './routes/field.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// API Routes
app.use('/api/users', userRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/purchase-accounts', purchaseAccountRoutes)
app.use('/api/fields', fieldRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
  })
})

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('서버 오류:', err)
  res.status(500).json({
    success: false,
    message: '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  })
})

// 서버 시작
const startServer = async () => {
  // 데이터베이스 연결 테스트
  const dbConnected = await testConnection()
  if (!dbConnected) {
    console.error('데이터베이스 연결에 실패했습니다. 서버를 시작할 수 없습니다.')
    process.exit(1)
  }

  const server = app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
    console.log(`📡 API 엔드포인트: http://localhost:${PORT}/api`)
    console.log(`👥 사용자 API: http://localhost:${PORT}/api/users`)
    console.log(`🏢 거래처 API: http://localhost:${PORT}/api/accounts`)
    console.log(`🛒 매입거래처 API: http://localhost:${PORT}/api/purchase-accounts`)
    console.log(`🏗️ 현장 API: http://localhost:${PORT}/api/fields`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 포트 ${PORT}가 이미 사용 중입니다.`)
      console.error(`다른 포트를 사용하거나 기존 프로세스를 종료하세요.`)
      console.error(`포트를 변경하려면 .env 파일의 PORT 값을 수정하세요.`)
      process.exit(1)
    } else {
      throw err
    }
  })
}

startServer()
