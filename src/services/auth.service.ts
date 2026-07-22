import { api, setAuthToken } from "../api/api";
import { RegisterRequest, LoginRequest, AuthResponse } from "../types";

export interface AuthResponseEnvelope {
  statusCode: number;
  success: boolean;
  data: {
    id?: number | string;
    Id?: number | string;
    token?: string;
    Token?: string;
    storeName?: string;
    StoreName?: string;
    phoneNumber?: string;
    PhoneNumber?: string;
    location?: string;
    Location?: string;
    isActive?: boolean;
    IsActive?: boolean;
    role?: string | string[];
    Role?: string | string[];
    roles?: string[];
    Roles?: string[];
  } | null;
  errors: string[] | null;
}

const normalizeRole = (role?: string | string[] | null): string => {
  if (Array.isArray(role)) {
    return role.join(",");
  }
  return role || "";
};

const mapAuthUser = (data: NonNullable<AuthResponseEnvelope["data"]>): AuthResponse => {
  const token = data.token || data.Token || "";
  const storeName = data.storeName || data.StoreName || "";
  const phoneNumber = data.phoneNumber || data.PhoneNumber || "";
  const location = data.location || data.Location || "";
  const isActive = data.isActive ?? data.IsActive ?? false;
  const role = normalizeRole(data.role || data.Role || data.roles || data.Roles);

  if (token) {
    setAuthToken(token);
  }

  return {
    user: {
      id: String(data.id || data.Id || storeName || phoneNumber),
      fullName: storeName,
      phone: phoneNumber,
      location,
      isActive,
      role,
    },
    token,
  };
};

export const authService = {
  /**
   * Registers a new user with full name, phone number, and password.
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponseEnvelope>("/Auth/Register", {
      StoreName: data.storeName.trim(),
      PhoneNumber: data.phone,
      Password: data.password,
      PasswordConfirmation: data.confirmPassword || data.password,
      Location: data.location || "",
    });

    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return mapAuthUser(responseData.data);
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية إنشاء الحساب. يرجى المحاولة مرة أخرى."
    );
  },

  /**
   * Log in user using phone and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponseEnvelope>("/Auth/Login", {
      PhoneNumber: data.phone,
      Password: data.password,
    });

    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return mapAuthUser(responseData.data);
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى."
    );
  },

  /**
   * Log out current user session
   */
  async logout(): Promise<void> {
    setAuthToken(null);
  },

  /**
   * Retrieves the current authenticated user's data from `/Auth/Me`
   */
  async me(): Promise<AuthResponse["user"]> {
    const response = await api.get<AuthResponseEnvelope>("/Auth/Me");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return mapAuthUser(responseData.data).user;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية جلب بيانات المستخدم."
    );
  },
};
