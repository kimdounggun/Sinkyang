import pool from '../config/database'
import { User, CreateUserDto, UpdateUserDto, UserQuery } from '../types/user'

export class UserModel {
  // 전체 사용자 목록 조회
  static async findAll(query: UserQuery = {}) {
    const { page = 1, limit = 100, search, department, grade, status = '활성' } = query
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        id,
        name,
        grade,
        department,
        email,
        phone,
        status,
        created_at,
        updated_at
      FROM users
      WHERE status != '삭제'
    `
    const params: any[] = []

    // 검색 조건 추가
    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR department LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (department) {
      sql += ` AND department = ?`
      params.push(department)
    }

    if (grade) {
      sql += ` AND grade = ?`
      params.push(grade)
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`
      params.push(status)
    }

    // LIMIT과 OFFSET은 정수값이므로 SQL에 직접 삽입 (SQL injection 위험 없음)
    sql += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    const [rows] = await pool.execute(sql, params)
    return rows as User[]
  }

  // 전체 사용자 수 조회
  static async count(query: UserQuery = {}) {
    const { search, department, grade, status = '활성' } = query

    let sql = `SELECT COUNT(*) as total FROM users WHERE status != '삭제'`
    const params: any[] = []

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ? OR department LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (department) {
      sql += ` AND department = ?`
      params.push(department)
    }

    if (grade) {
      sql += ` AND grade = ?`
      params.push(grade)
    }

    if (status && status !== 'all') {
      sql += ` AND status = ?`
      params.push(status)
    }

    const [rows] = await pool.execute(sql, params) as any[]
    return rows[0].total
  }

  // ID로 사용자 조회
  static async findById(id: string) {
    const sql = `
      SELECT 
        id,
        name,
        grade,
        department,
        email,
        phone,
        status,
        created_at,
        updated_at,
        created_by,
        updated_by
      FROM users
      WHERE id = ?
    `
    const [rows] = await pool.execute(sql, [id]) as any[]
    return rows[0] as User | undefined
  }

  // 사용자 생성
  static async create(userData: CreateUserDto) {
    const sql = `
      INSERT INTO users (
        id,
        name,
        grade,
        department,
        email,
        phone,
        password,
        status,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '활성', ?)
    `
    const params = [
      userData.id,
      userData.name,
      userData.grade,
      userData.department,
      userData.email || null,
      userData.phone || null,
      userData.password || null,
      userData.created_by || null,
    ]

    await pool.execute(sql, params)
    return this.findById(userData.id)
  }

  // 사용자 수정
  static async update(id: string, userData: UpdateUserDto) {
    const fields: string[] = []
    const params: any[] = []
    let newId = id

    // ID 변경이 있는 경우 처리
    if (userData.id !== undefined && userData.id !== id) {
      // 새 ID가 이미 존재하는지 확인
      const idExists = await this.existsById(userData.id)
      if (idExists) {
        throw new Error('이미 존재하는 사용자 ID입니다.')
      }
      fields.push('id = ?')
      params.push(userData.id)
      newId = userData.id
    }

    if (userData.name !== undefined) {
      fields.push('name = ?')
      params.push(userData.name)
    }
    if (userData.grade !== undefined) {
      fields.push('grade = ?')
      params.push(userData.grade)
    }
    if (userData.department !== undefined) {
      fields.push('department = ?')
      params.push(userData.department)
    }
    if (userData.email !== undefined) {
      fields.push('email = ?')
      params.push(userData.email)
    }
    if (userData.phone !== undefined) {
      fields.push('phone = ?')
      params.push(userData.phone)
    }
    if (userData.updated_by !== undefined) {
      fields.push('updated_by = ?')
      params.push(userData.updated_by)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    params.push(id)
    const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await pool.execute(sql, params)
    return this.findById(newId)
  }

  // 사용자 삭제 (소프트 삭제)
  static async delete(id: string, updatedBy?: string) {
    const sql = `UPDATE users SET status = '삭제', updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    await pool.execute(sql, [updatedBy || null, id])
    return true
  }

  // ID 중복 확인
  static async existsById(id: string) {
    const sql = `SELECT COUNT(*) as count FROM users WHERE id = ?`
    const [rows] = await pool.execute(sql, [id]) as any[]
    return rows[0].count > 0
  }

  // 이메일 중복 확인
  static async existsByEmail(email: string, excludeId?: string) {
    let sql = `SELECT COUNT(*) as count FROM users WHERE email = ?`
    const params: any[] = [email]

    if (excludeId) {
      sql += ` AND id != ?`
      params.push(excludeId)
    }

    const [rows] = await pool.execute(sql, params) as any[]
    return rows[0].count > 0
  }
}
