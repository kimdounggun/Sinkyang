import pool from '../config/database'
import { Field, CreateFieldDto, UpdateFieldDto, FieldQuery } from '../types/field'

export class FieldModel {
  // 전체 현장 목록 조회
  static async findAll(query: FieldQuery = {}) {
    const { page = 1, limit = 100, search, accountId } = query
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        f.id,
        f.account_id,
        f.field_name,
        f.created_at,
        f.updated_at,
        a.name as account_name
      FROM fields f
      LEFT JOIN accounts a ON f.account_id = a.id
      WHERE 1=1
    `
    const params: any[] = []

    // 검색 조건 추가
    if (search) {
      sql += ` AND (f.field_name LIKE ? OR a.name LIKE ? OR f.account_id LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (accountId) {
      sql += ` AND f.account_id = ?`
      params.push(accountId)
    }

    sql += ` ORDER BY f.created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    const [rows] = await pool.execute(sql, params)
    return (rows as any[]).map((row) => ({
      id: row.id,
      accountId: row.account_id,
      accountName: row.account_name,
      fieldName: row.field_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as (Field & { accountName?: string })[]
  }

  // 전체 현장 수 조회
  static async count(query: FieldQuery = {}) {
    const { search, accountId } = query

    let sql = `SELECT COUNT(*) as total FROM fields f WHERE 1=1`
    const params: any[] = []

    if (search) {
      sql += ` AND (f.field_name LIKE ? OR f.account_id LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern)
    }

    if (accountId) {
      sql += ` AND f.account_id = ?`
      params.push(accountId)
    }

    const [rows] = await pool.execute(sql, params) as any[]
    return rows[0].total
  }

  // ID로 현장 조회
  static async findById(id: string) {
    const sql = `
      SELECT 
        f.id,
        f.account_id,
        f.field_name,
        f.created_at,
        f.updated_at,
        f.created_by,
        f.updated_by,
        a.name as account_name
      FROM fields f
      LEFT JOIN accounts a ON f.account_id = a.id
      WHERE f.id = ?
    `
    const [rows] = await pool.execute(sql, [id]) as any[]
    if (!rows[0]) return undefined

    const row = rows[0]
    return {
      id: row.id,
      accountId: row.account_id,
      accountName: row.account_name,
      fieldName: row.field_name,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      updated_by: row.updated_by,
    } as Field & { accountName?: string }
  }

  // 현장 생성
  static async create(fieldData: CreateFieldDto) {
    // ID가 없거나 빈 문자열이면 자동 생성 (F001, F002 형식)
    let fieldId = fieldData.id?.trim()
    if (!fieldId) {
      // 가장 큰 ID를 찾아서 다음 번호 생성
      const [maxRows] = await pool.execute(
        `SELECT id FROM fields WHERE id LIKE 'F%' ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC LIMIT 1`
      ) as any[]
      
      if (maxRows && maxRows.length > 0) {
        const maxId = maxRows[0].id
        const numPart = parseInt(maxId.substring(1)) || 0
        fieldId = `F${String(numPart + 1).padStart(3, '0')}`
      } else {
        fieldId = 'F001'
      }
    }

    // ID 중복 확인
    const idExists = await this.existsById(fieldId)
    if (idExists) {
      throw new Error('이미 존재하는 현장 ID입니다.')
    }

    const sql = `
      INSERT INTO fields (
        id,
        account_id,
        field_name,
        created_by
      ) VALUES (?, ?, ?, ?)
    `
    const params = [
      fieldId,
      fieldData.accountId,
      fieldData.fieldName,
      fieldData.created_by || null,
    ]

    await pool.execute(sql, params)
    return this.findById(fieldId)
  }

  // 현장 수정
  static async update(id: string, fieldData: UpdateFieldDto) {
    const fields: string[] = []
    const params: any[] = []
    let newId = id

    // ID 변경이 있는 경우 처리
    if (fieldData.id !== undefined && fieldData.id !== id) {
      const idExists = await this.existsById(fieldData.id)
      if (idExists) {
        throw new Error('이미 존재하는 현장 ID입니다.')
      }
      fields.push('id = ?')
      params.push(fieldData.id)
      newId = fieldData.id
    }

    if (fieldData.accountId !== undefined) {
      fields.push('account_id = ?')
      params.push(fieldData.accountId)
    }
    if (fieldData.fieldName !== undefined) {
      fields.push('field_name = ?')
      params.push(fieldData.fieldName)
    }
    if (fieldData.updated_by !== undefined) {
      fields.push('updated_by = ?')
      params.push(fieldData.updated_by)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    params.push(id)
    const sql = `UPDATE fields SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await pool.execute(sql, params)
    return this.findById(newId)
  }

  // 현장 삭제
  static async delete(id: string) {
    const sql = `DELETE FROM fields WHERE id = ?`
    await pool.execute(sql, [id])
    return true
  }

  // ID 중복 확인
  static async existsById(id: string) {
    const sql = `SELECT COUNT(*) as count FROM fields WHERE id = ?`
    const [rows] = await pool.execute(sql, [id]) as any[]
    return rows[0].count > 0
  }
}
