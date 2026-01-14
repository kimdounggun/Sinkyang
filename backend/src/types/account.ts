export interface Account {
  id: string
  name: string
  registrationNumber?: string
  representative?: string
  phone?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  item?: string
  invoice?: string
  collectionDate?: string
  closingDate?: string
  created_at?: Date
  updated_at?: Date
  created_by?: string
  updated_by?: string
}

export interface CreateAccountDto {
  id: string
  name: string
  registrationNumber?: string
  representative?: string
  phone?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  item?: string
  invoice?: string
  collectionDate?: string
  closingDate?: string
  created_by?: string
}

export interface UpdateAccountDto {
  id?: string
  name?: string
  registrationNumber?: string
  representative?: string
  phone?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  item?: string
  invoice?: string
  collectionDate?: string
  closingDate?: string
  updated_by?: string
}

export interface AccountQuery {
  page?: number
  limit?: number
  search?: string
  businessType?: string
  businessCategory?: string
}
