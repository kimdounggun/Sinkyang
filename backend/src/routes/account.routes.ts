import express from 'express'
import { AccountController } from '../controllers/account.controller'

const router = express.Router()

// 전체 거래처 목록 조회
router.get('/', AccountController.getAll)

// 특정 거래처 조회
router.get('/:id', AccountController.getById)

// 거래처 생성
router.post('/', AccountController.create)

// 거래처 수정
router.put('/:id', AccountController.update)

// 거래처 삭제
router.delete('/:id', AccountController.delete)

export default router
