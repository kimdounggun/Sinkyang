import { Request, Response } from 'express'
import { AccountModel } from '../models/account.model'
import { CreateAccountDto, UpdateAccountDto, AccountQuery } from '../types/account'

export class AccountController {
  // 전체 거래처 목록 조회
  static async getAll(req: Request, res: Response) {
    try {
      const query: AccountQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 100,
        search: req.query.search as string,
        businessType: req.query.businessType as string,
        businessCategory: req.query.businessCategory as string,
      }

      const accounts = await AccountModel.findAll(query)
      const total = await AccountModel.count(query)

      res.json({
        success: true,
        data: accounts,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / (query.limit || 100)),
        },
      })
    } catch (error) {
      console.error('거래처 목록 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '거래처 목록을 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 특정 거래처 조회
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const account = await AccountModel.findById(id)

      if (!account) {
        return res.status(404).json({
          success: false,
          message: '거래처를 찾을 수 없습니다.',
        })
      }

      res.json({
        success: true,
        data: account,
      })
    } catch (error) {
      console.error('거래처 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '거래처를 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 거래처 생성
  static async create(req: Request, res: Response) {
    try {
      const accountData: CreateAccountDto = req.body

      // 필수 필드 검증 (ID는 자동 생성되므로 name만 확인)
      if (!accountData.name) {
        return res.status(400).json({
          success: false,
          message: '필수 필드(name)가 누락되었습니다.',
        })
      }

      const account = await AccountModel.create(accountData)

      res.status(201).json({
        success: true,
        message: '거래처가 성공적으로 생성되었습니다.',
        data: account,
      })
    } catch (error) {
      console.error('거래처 생성 오류:', error)
      res.status(500).json({
        success: false,
        message: '거래처를 생성하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 거래처 수정
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const accountData: UpdateAccountDto = req.body

      // 거래처 존재 확인
      const existingAccount = await AccountModel.findById(id)
      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: '거래처를 찾을 수 없습니다.',
        })
      }

      const account = await AccountModel.update(id, accountData)

      res.json({
        success: true,
        message: '거래처 정보가 성공적으로 수정되었습니다.',
        data: account,
      })
    } catch (error) {
      console.error('거래처 수정 오류:', error)
      res.status(500).json({
        success: false,
        message: '거래처 정보를 수정하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 거래처 삭제
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      // 거래처 존재 확인
      const existingAccount = await AccountModel.findById(id)
      if (!existingAccount) {
        return res.status(404).json({
          success: false,
          message: '거래처를 찾을 수 없습니다.',
        })
      }

      await AccountModel.delete(id)

      res.json({
        success: true,
        message: '거래처가 성공적으로 삭제되었습니다.',
      })
    } catch (error) {
      console.error('거래처 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '거래처를 삭제하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
