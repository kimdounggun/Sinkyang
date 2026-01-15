export interface Account {
  id: string
  name: string
  printName?: string
  registrationNumber?: string
  representative?: string
  residentRegistrationNumber?: string
  phone?: string
  fax?: string
  address?: string
  postalCode?: string
  businessType?: string
  businessCategory?: string
  electronicInvoiceInput?: string
  email?: string
  collectionDate?: string
  remarks?: string
  closingDate?: string
  invoice?: string
  contactPerson?: string
  contactPersonPhone?: string
  created_at?: Date
  updated_at?: Date
  created_by?: string
  updated_by?: string
}

export interface CreateAccountDto {
  id: string
  name: string
  printName?: string
  registrationNumber?: string
  representative?: string
  residentRegistrationNumber?: string
  phone?: string
  fax?: string
  address?: string
  postalCode?: string
  businessType?: string
  businessCategory?: string
  electronicInvoiceInput?: string
  email?: string
  collectionDate?: string
  remarks?: string
  closingDate?: string
  invoice?: string
  contactPerson?: string
  contactPersonPhone?: string
  created_by?: string
}

export interface UpdateAccountDto {
  id?: string
  name?: string
  printName?: string
  registrationNumber?: string
  representative?: string
  residentRegistrationNumber?: string
  phone?: string
  fax?: string
  address?: string
  postalCode?: string
  businessType?: string
  businessCategory?: string
  electronicInvoiceInput?: string
  email?: string
  collectionDate?: string
  remarks?: string
  closingDate?: string
  invoice?: string
  contactPerson?: string
  contactPersonPhone?: string
  updated_by?: string
}

export interface AccountQuery {
  page?: number
  limit?: number
  search?: string
  businessType?: string
  businessCategory?: string
}
