export interface User {
  id: string
  name: string
  grade: string
  department: string
  email?: string
  phone?: string
  password?: string
  status?: string
  created_at?: Date
  updated_at?: Date
  created_by?: string
  updated_by?: string
}

export interface CreateUserDto {
  id: string
  name: string
  grade: string
  department: string
  email?: string
  phone?: string
  password?: string
  created_by?: string
}

export interface UpdateUserDto {
  id?: string
  name?: string
  grade?: string
  department?: string
  email?: string
  phone?: string
  updated_by?: string
}

export interface UserQuery {
  page?: number
  limit?: number
  search?: string
  department?: string
  grade?: string
  status?: string
}
