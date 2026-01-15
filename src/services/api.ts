const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface User {
  id: string
  name: string
  grade: string
  department: string
  email?: string
  phone?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateUserDto {
  id: string
  name: string
  grade: string
  department: string
  email?: string
  phone?: string
  password?: string
}

export interface UpdateUserDto {
  id?: string
  name?: string
  grade?: string
  department?: string
  email?: string
  phone?: string
}

export interface UserListResponse {
  success: boolean
  data: User[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// API 응답 기본 타입
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Fetch 래퍼 함수
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API 요청 실패')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 사용자 API
export const userApi = {
  // 전체 사용자 목록 조회
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    department?: string
    grade?: string
    status?: string
  }): Promise<UserListResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    const response = await fetchApi<UserListResponse>(`/users${query ? `?${query}` : ''}`)
    // 백엔드가 { success, data, pagination } 구조로 반환하므로 그대로 반환
    return response as UserListResponse
  },

  // 특정 사용자 조회
  getById: async (id: string): Promise<User> => {
    const response = await fetchApi<User>(`/users/${id}`)
    return response.data!
  },

  // 사용자 생성
  create: async (userData: CreateUserDto): Promise<User> => {
    const response = await fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return response.data!
  },

  // 사용자 수정
  update: async (id: string, userData: UpdateUserDto): Promise<User> => {
    const response = await fetchApi<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    return response.data!
  },

  // 사용자 삭제
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/users/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== Account (거래처) API ====================

export interface Account {
  id: string
  name: string // 거래처명
  registrationNumber?: string // 등록번호
  representative?: string // 대표자
  phone?: string // 전화번호
  fax?: string // FAX
  businessType?: string // 업태
  businessCategory?: string // 업종
  item?: string // 항목
  invoice?: string // 계산서
  collectionDate?: string // 수금일
  closingDate?: string // 마감일
  created_at?: string
  updated_at?: string
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
}

export interface AccountListResponse {
  success: boolean
  data: Account[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 거래처 API
export const accountApi = {
  // 전체 거래처 목록 조회
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    businessType?: string
    businessCategory?: string
  }): Promise<AccountListResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    const response = await fetchApi<AccountListResponse>(`/accounts${query ? `?${query}` : ''}`)
    return response as AccountListResponse
  },

  // 특정 거래처 조회
  getById: async (id: string): Promise<Account> => {
    const response = await fetchApi<Account>(`/accounts/${id}`)
    return response.data!
  },

  // 거래처 생성
  create: async (accountData: CreateAccountDto): Promise<Account> => {
    const response = await fetchApi<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
    return response.data!
  },

  // 거래처 수정
  update: async (id: string, accountData: UpdateAccountDto): Promise<Account> => {
    const response = await fetchApi<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    })
    return response.data!
  },

  // 거래처 삭제
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/accounts/${id}`, {
      method: 'DELETE',
    })
  },
}

// ==================== PurchaseAccount (매입거래처) API ====================

export interface PurchaseAccount {
  id: string
  name: string // 거래처명
  printName?: string // 출력명
  representative?: string // 대표자
  address?: string // 주소
  postalCode?: string // 우편번호
  phone?: string // 전화번호
  registrationNumber?: string // 등록번호
  fax?: string // FAX
  businessType?: string // 업태
  businessCategory?: string // 종목
  remarks?: string // 비고
  depositAccount?: string // 입금계좌
  paymentDate?: string // 지불일
  closingDate?: string // 마감일
  created_at?: string
  updated_at?: string
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
}

export interface PurchaseAccountListResponse {
  success: boolean
  data: PurchaseAccount[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 매입거래처 API
export const purchaseAccountApi = {
  // 전체 매입거래처 목록 조회
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    businessType?: string
    businessCategory?: string
  }): Promise<PurchaseAccountListResponse> => {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    const response = await fetchApi<PurchaseAccountListResponse>(`/purchase-accounts${query ? `?${query}` : ''}`)
    return response as PurchaseAccountListResponse
  },

  // 특정 매입거래처 조회
  getById: async (id: string): Promise<PurchaseAccount> => {
    const response = await fetchApi<PurchaseAccount>(`/purchase-accounts/${id}`)
    if (!response.data) {
      throw new Error('매입거래처를 찾을 수 없습니다.')
    }
    return response.data
  },

  // 매입거래처 생성
  create: async (data: CreatePurchaseAccountDto): Promise<PurchaseAccount> => {
    const response = await fetchApi<PurchaseAccount>('/purchase-accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (!response.data) {
      throw new Error('매입거래처 생성에 실패했습니다.')
    }
    return response.data
  },

  // 매입거래처 수정
  update: async (id: string, data: UpdatePurchaseAccountDto): Promise<PurchaseAccount> => {
    const response = await fetchApi<PurchaseAccount>(`/purchase-accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    if (!response.data) {
      throw new Error('매입거래처 수정에 실패했습니다.')
    }
    return response.data
  },

  // 매입거래처 삭제
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/purchase-accounts/${id}`, {
      method: 'DELETE',
    })
  },
}
