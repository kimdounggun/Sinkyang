import express from 'express'
import { FieldController } from '../controllers/field.controller'

const router = express.Router()

// 전체 현장 목록 조회
router.get('/', FieldController.getAll)

// 특정 현장 조회
router.get('/:id', FieldController.getById)

// 현장 생성
router.post('/', FieldController.create)

// 현장 수정
router.put('/:id', FieldController.update)

// 현장 삭제
router.delete('/:id', FieldController.delete)

export default router
