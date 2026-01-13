import express from 'express'
import { UserController } from '../controllers/user.controller'

const router = express.Router()

// 전체 사용자 목록 조회
router.get('/', UserController.getAll)

// 특정 사용자 조회
router.get('/:id', UserController.getById)

// 사용자 생성
router.post('/', UserController.create)

// 사용자 수정
router.put('/:id', UserController.update)

// 사용자 삭제
router.delete('/:id', UserController.delete)

export default router
