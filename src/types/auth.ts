export interface RegisterRequest {
  storeName: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  location?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    fullName: string;
    phone: string;
    location?: string;
    isActive: boolean;
    role?: string;
  };
  token: string;
}

export interface LoginRequest {
  phone: string;
  password?: string;
}
