export interface PurchaseAccount {
  id: string
  name: string
  printName?: string
  representative?: string
  address?: string
  postalCode?: string
  phone?: string
  registrationNumber?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  remarks?: string
  depositAccount?: string
  paymentDate?: string
  closingDate?: string
  created_at?: Date
  updated_at?: Date
  created_by?: string
  updated_by?: string
}

export interface CreatePurchaseAccountDto {
  id?: string
  name: string
  printName?: string
  representative?: string
  address?: string
  postalCode?: string
  phone?: string
  registrationNumber?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  remarks?: string
  depositAccount?: string
  paymentDate?: string
  closingDate?: string
  created_by?: string
}

export interface UpdatePurchaseAccountDto {
  id?: string
  name?: string
  printName?: string
  representative?: string
  address?: string
  postalCode?: string
  phone?: string
  registrationNumber?: string
  fax?: string
  businessType?: string
  businessCategory?: string
  remarks?: string
  depositAccount?: string
  paymentDate?: string
  closingDate?: string
  updated_by?: string
}

export interface PurchaseAccountQuery {
  page?: number
  limit?: number
  search?: string
  businessType?: string
  businessCategory?: string
}