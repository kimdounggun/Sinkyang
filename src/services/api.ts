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
