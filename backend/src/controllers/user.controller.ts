import { Request, Response } from 'express'
import { UserModel } from '../models/user.model'
import { CreateUserDto, UpdateUserDto, UserQuery } from '../types/user'

export class UserController {
  // 전체 사용자 목록 조회
  static async getAll(req: Request, res: Response) {
    try {
      const query: UserQuery = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 100,
        search: req.query.search as string,
        department: req.query.department as string,
        grade: req.query.grade as string,
        status: (req.query.status as string) || '활성',
      }

      const users = await UserModel.findAll(query)
      const total = await UserModel.count(query)

      res.json({
        success: true,
        data: users,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / (query.limit || 100)),
        },
      })
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '사용자 목록을 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 특정 사용자 조회
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = await UserModel.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        })
      }

      res.json({
        success: true,
        data: user,
      })
    } catch (error) {
      console.error('사용자 조회 오류:', error)
      res.status(500).json({
        success: false,
        message: '사용자를 조회하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 사용자 생성
  static async create(req: Request, res: Response) {
    try {
      const userData: CreateUserDto = req.body

      // 필수 필드 검증
      if (!userData.id || !userData.name || !userData.grade || !userData.department) {
        return res.status(400).json({
          success: false,
          message: '필수 필드(id, name, grade, department)가 누락되었습니다.',
        })
      }

      // ID 중복 확인
      const idExists = await UserModel.existsById(userData.id)
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: '이미 존재하는 사용자 ID입니다.',
        })
      }

      // 이메일 중복 확인 (이메일이 있는 경우)
      if (userData.email) {
        const emailExists = await UserModel.existsByEmail(userData.email)
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: '이미 사용 중인 이메일입니다.',
          })
        }
      }

      const user = await UserModel.create(userData)

      res.status(201).json({
        success: true,
        message: '사용자가 성공적으로 생성되었습니다.',
        data: user,
      })
    } catch (error) {
      console.error('사용자 생성 오류:', error)
      res.status(500).json({
        success: false,
        message: '사용자를 생성하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 사용자 수정
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userData: UpdateUserDto = req.body

      // 사용자 존재 확인
      const existingUser = await UserModel.findById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        })
      }

      // 이메일 중복 확인 (이메일이 변경되는 경우)
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await UserModel.existsByEmail(userData.email, id)
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: '이미 사용 중인 이메일입니다.',
          })
        }
      }

      const user = await UserModel.update(id, userData)

      res.json({
        success: true,
        message: '사용자 정보가 성공적으로 수정되었습니다.',
        data: user,
      })
    } catch (error) {
      console.error('사용자 수정 오류:', error)
      res.status(500).json({
        success: false,
        message: '사용자 정보를 수정하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // 사용자 삭제
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params

      // 사용자 존재 확인
      const existingUser = await UserModel.findById(id)
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        })
      }

      await UserModel.delete(id)

      res.json({
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다.',
      })
    } catch (error) {
      console.error('사용자 삭제 오류:', error)
      res.status(500).json({
        success: false,
        message: '사용자를 삭제하는 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
