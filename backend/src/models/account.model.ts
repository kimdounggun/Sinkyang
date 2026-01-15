import pool from '../config/database'
import { Account, CreateAccountDto, UpdateAccountDto, AccountQuery } from '../types/account'

export class AccountModel {
  // 전체 거래처 목록 조회
  static async findAll(query: AccountQuery = {}) {
    const { page = 1, limit = 100, search, businessType, businessCategory } = query
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        id,
        name,
        print_name,
        registration_number,
        representative,
        resident_registration_number,
        phone,
        fax,
        address,
        postal_code,
        business_type,
        business_category,
        electronic_invoice_input,
        email,
        collection_date,
        remarks,
        closing_date,
        invoice,
        contact_person,
        contact_person_phone,
        created_at,
        updated_at
      FROM accounts
      WHERE 1=1
    `
    const params: any[] = []

    // 검색 조건 추가
    if (search) {
      sql += ` AND (name LIKE ? OR representative LIKE ? OR phone LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (businessType) {
      sql += ` AND business_type = ?`
      params.push(businessType)
    }

    if (businessCategory) {
      sql += ` AND business_category = ?`
      params.push(businessCategory)
    }

    sql += ` ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    const [rows] = await pool.execute(sql, params)
    return (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      printName: row.print_name,
      registrationNumber: row.registration_number,
      representative: row.representative,
      residentRegistrationNumber: row.resident_registration_number,
      phone: row.phone,
      fax: row.fax,
      address: row.address,
      postalCode: row.postal_code,
      businessType: row.business_type,
      businessCategory: row.business_category,
      electronicInvoiceInput: row.electronic_invoice_input,
      email: row.email,
      collectionDate: row.collection_date,
      remarks: row.remarks,
      closingDate: row.closing_date,
      invoice: row.invoice,
      contactPerson: row.contact_person,
      contactPersonPhone: row.contact_person_phone,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as Account[]
  }

  // 전체 거래처 수 조회
  static async count(query: AccountQuery = {}) {
    const { search, businessType, businessCategory } = query

    let sql = `SELECT COUNT(*) as total FROM accounts WHERE 1=1`
    const params: any[] = []

    if (search) {
      sql += ` AND (name LIKE ? OR representative LIKE ? OR phone LIKE ?)`
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern)
    }

    if (businessType) {
      sql += ` AND business_type = ?`
      params.push(businessType)
    }

    if (businessCategory) {
      sql += ` AND business_category = ?`
      params.push(businessCategory)
    }

    const [rows] = await pool.execute(sql, params) as any[]
    return rows[0].total
  }

  // ID로 거래처 조회
  static async findById(id: string) {
    const sql = `
      SELECT 
        id,
        name,
        print_name,
        registration_number,
        representative,
        resident_registration_number,
        phone,
        fax,
        address,
        postal_code,
        business_type,
        business_category,
        electronic_invoice_input,
        email,
        collection_date,
        remarks,
        closing_date,
        invoice,
        contact_person,
        contact_person_phone,
        created_at,
        updated_at,
        created_by,
        updated_by
      FROM accounts
      WHERE id = ?
    `
    const [rows] = await pool.execute(sql, [id]) as any[]
    if (!rows[0]) return undefined

    const row = rows[0]
    return {
      id: row.id,
      name: row.name,
      printName: row.print_name,
      registrationNumber: row.registration_number,
      representative: row.representative,
      residentRegistrationNumber: row.resident_registration_number,
      phone: row.phone,
      fax: row.fax,
      address: row.address,
      postalCode: row.postal_code,
      businessType: row.business_type,
      businessCategory: row.business_category,
      electronicInvoiceInput: row.electronic_invoice_input,
      email: row.email,
      collectionDate: row.collection_date,
      remarks: row.remarks,
      closingDate: row.closing_date,
      invoice: row.invoice,
      contactPerson: row.contact_person,
      contactPersonPhone: row.contact_person_phone,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      updated_by: row.updated_by,
    } as Account
  }

  // 거래처 생성
  static async create(accountData: CreateAccountDto) {
    // ID가 없거나 빈 문자열이면 자동 생성 (A001, A002 형식)
    let accountId = accountData.id?.trim()
    if (!accountId) {
      // 가장 큰 ID를 찾아서 다음 번호 생성
      const [maxRows] = await pool.execute(
        `SELECT id FROM accounts WHERE id LIKE 'A%' ORDER BY CAST(SUBSTRING(id, 2) AS UNSIGNED) DESC LIMIT 1`
      ) as any[]
      
      if (maxRows && maxRows.length > 0) {
        const maxId = maxRows[0].id
        const numPart = parseInt(maxId.substring(1)) || 0
        accountId = `A${String(numPart + 1).padStart(3, '0')}`
      } else {
        accountId = 'A001'
      }
    }

    // ID 중복 확인
    const idExists = await this.existsById(accountId)
    if (idExists) {
      throw new Error('이미 존재하는 거래처 ID입니다.')
    }

    const sql = `
      INSERT INTO accounts (
        id,
        name,
        print_name,
        registration_number,
        representative,
        resident_registration_number,
        phone,
        fax,
        address,
        postal_code,
        business_type,
        business_category,
        electronic_invoice_input,
        email,
        collection_date,
        remarks,
        closing_date,
        invoice,
        contact_person,
        contact_person_phone,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    const params = [
      accountId,
      accountData.name,
      accountData.printName || null,
      accountData.registrationNumber || null,
      accountData.representative || null,
      accountData.residentRegistrationNumber || null,
      accountData.phone || null,
      accountData.fax || null,
      accountData.address || null,
      accountData.postalCode || null,
      accountData.businessType || null,
      accountData.businessCategory || null,
      accountData.electronicInvoiceInput || null,
      accountData.email || null,
      accountData.collectionDate || null,
      accountData.remarks || null,
      accountData.closingDate || null,
      accountData.invoice || null,
      accountData.contactPerson || null,
      accountData.contactPersonPhone || null,
      accountData.created_by || null,
    ]

    await pool.execute(sql, params)
    return this.findById(accountId)
  }

  // 거래처 수정
  static async update(id: string, accountData: UpdateAccountDto) {
    const fields: string[] = []
    const params: any[] = []
    let newId = id

    // ID 변경이 있는 경우 처리
    if (accountData.id !== undefined && accountData.id !== id) {
      const idExists = await this.existsById(accountData.id)
      if (idExists) {
        throw new Error('이미 존재하는 거래처 ID입니다.')
      }
      fields.push('id = ?')
      params.push(accountData.id)
      newId = accountData.id
    }

    if (accountData.name !== undefined) {
      fields.push('name = ?')
      params.push(accountData.name)
    }
    if (accountData.printName !== undefined) {
      fields.push('print_name = ?')
      params.push(accountData.printName)
    }
    if (accountData.registrationNumber !== undefined) {
      fields.push('registration_number = ?')
      params.push(accountData.registrationNumber)
    }
    if (accountData.representative !== undefined) {
      fields.push('representative = ?')
      params.push(accountData.representative)
    }
    if (accountData.residentRegistrationNumber !== undefined) {
      fields.push('resident_registration_number = ?')
      params.push(accountData.residentRegistrationNumber)
    }
    if (accountData.phone !== undefined) {
      fields.push('phone = ?')
      params.push(accountData.phone)
    }
    if (accountData.fax !== undefined) {
      fields.push('fax = ?')
      params.push(accountData.fax)
    }
    if (accountData.address !== undefined) {
      fields.push('address = ?')
      params.push(accountData.address)
    }
    if (accountData.postalCode !== undefined) {
      fields.push('postal_code = ?')
      params.push(accountData.postalCode)
    }
    if (accountData.businessType !== undefined) {
      fields.push('business_type = ?')
      params.push(accountData.businessType)
    }
    if (accountData.businessCategory !== undefined) {
      fields.push('business_category = ?')
      params.push(accountData.businessCategory)
    }
    if (accountData.electronicInvoiceInput !== undefined) {
      fields.push('electronic_invoice_input = ?')
      params.push(accountData.electronicInvoiceInput)
    }
    if (accountData.email !== undefined) {
      fields.push('email = ?')
      params.push(accountData.email)
    }
    if (accountData.collectionDate !== undefined) {
      fields.push('collection_date = ?')
      params.push(accountData.collectionDate)
    }
    if (accountData.remarks !== undefined) {
      fields.push('remarks = ?')
      params.push(accountData.remarks)
    }
    if (accountData.closingDate !== undefined) {
      fields.push('closing_date = ?')
      params.push(accountData.closingDate)
    }
    if (accountData.invoice !== undefined) {
      fields.push('invoice = ?')
      params.push(accountData.invoice)
    }
    if (accountData.contactPerson !== undefined) {
      fields.push('contact_person = ?')
      params.push(accountData.contactPerson)
    }
    if (accountData.contactPersonPhone !== undefined) {
      fields.push('contact_person_phone = ?')
      params.push(accountData.contactPersonPhone)
    }
    if (accountData.updated_by !== undefined) {
      fields.push('updated_by = ?')
      params.push(accountData.updated_by)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    params.push(id)
    const sql = `UPDATE accounts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

    await pool.execute(sql, params)
    return this.findById(newId)
  }

  // 거래처 삭제
  static async delete(id: string, updatedBy?: string) {
    const sql = `DELETE FROM accounts WHERE id = ?`
    await pool.execute(sql, [id])
    return true
  }

  // ID 중복 확인
  static async existsById(id: string) {
    const sql = `SELECT COUNT(*) as count FROM accounts WHERE id = ?`
    const [rows] = await pool.execute(sql, [id]) as any[]
    return rows[0].count > 0
  }
}
