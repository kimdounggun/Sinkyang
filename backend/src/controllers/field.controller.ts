import { Request, Response } from 'express'
import { FieldModel } from '../models/field.model'
import { CreateFieldDto, UpdateFieldDto, FieldQuery } from '../types/field'

export class FieldController {
  // 전체 현장 목록 조회
  static async getAll(req: Request, res: Response) {
    try {
      const query: FieldQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 100,
        search: req.query.search as string,
        accountId: req.query.accountId as string,
      }

      const fields = await FieldModel.findAll(query)
      const total = await FieldModel.count(query)

      res.json({
        success: true,
        data: fields,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / (query.limit || 100)),
        },
      })
    } catch (error) {
      console.error('현장 목록 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '현장 목록을 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 특정 현장 조회
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const field = await FieldModel.findById(id)

      if (!field) {
        return res.status(404).json({
          success: false,
          message: '현장을 찾을 수 없습니다.',
        })
      }

      res.json({
        success: true,
        data: field,
      })
    } catch (error) {
      console.error('현장 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '현장을 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 현장 생성
  static async create(req: Request, res: Response) {
    try {
      const fieldData: CreateFieldDto = req.body

      // 필수 필드 검증
      if (!fieldData.accountId || !fieldData.fieldName) {
        return res.status(400).json({
          success: false,
          message: '필수 필드(accountId, fieldName)가 누락되었습니다.',
        })
      }

      const field = await FieldModel.create(fieldData)

      res.status(201).json({
        success: true,
        message: '현장이 성공적으로 생성되었습니다.',
        data: field,
      })
    } catch (error) {
      console.error('현장 생성 오류:', error)
      res.status(500).json({
        success: false,
        message: '현장을 생성하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 현장 수정
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const fieldData: UpdateFieldDto = req.body

      // 현장 존재 확인
      const existingField = await FieldModel.findById(id)
      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: '현장을 찾을 수 없습니다.',
        })
      }

      const field = await FieldModel.update(id, fieldData)

      res.json({
        success: true,
        message: '현장 정보가 성공적으로 수정되었습니다.',
        data: field,
      })
    } catch (error) {
      console.error('현장 수정 오류:', error)
      res.status(500).json({
        success: false,
        message: '현장 정보를 수정하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 현장 삭제
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      // 현장 존재 확인
      const existingField = await FieldModel.findById(id)
      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: '현장을 찾을 수 없습니다.',
        })
      }

      await FieldModel.delete(id)

      res.json({
        success: true,
        message: '현장이 성공적으로 삭제되었습니다.',
      })
    } catch (error) {
      console.error('현장 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '현장을 삭제하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
