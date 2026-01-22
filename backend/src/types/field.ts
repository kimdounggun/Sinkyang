export interface Field {
  id: string
  accountId: string // 거래처 ID
  fieldName: string // 현장명
  created_at?: Date
  updated_at?: Date
  created_by?: string
  updated_by?: string
}

export interface CreateFieldDto {
  id?: string
  accountId: string
  fieldName: string
  created_by?: string
}

export interface UpdateFieldDto {
  id?: string
  accountId?: string
  fieldName?: string
  updated_by?: string
}

export interface FieldQuery {
  page?: number
  limit?: number
  search?: string
  accountId?: string
}
