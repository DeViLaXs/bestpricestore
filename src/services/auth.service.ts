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
    try {
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
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية إنشاء الحساب. يرجى المحاولة مرة أخرى."
        );
      }
    } catch (error: any) {
      // Development mode fallback simulation (if backend is not active or unreachable)
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating successful mock registration...");
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockResponse: AuthResponse = {
              user: {
                id: "mock-user-123",
                fullName: data.storeName,
                phone: data.phone,
                location: data.location,
                isActive: false, // Registered users are pending by default
              },
              token: "mock-jwt-token-xyz",
            };
            setAuthToken(mockResponse.token);
            resolve(mockResponse);
          }, 1500); // 1.5 seconds network delay simulation
        });
      }
      throw error;
    }
  },

  /**
   * Log in user using phone and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponseEnvelope>("/Auth/Login", {
        PhoneNumber: data.phone,
        Password: data.password,
      });

      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return mapAuthUser(responseData.data);
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating successful mock login...");
        return new Promise((resolve) => {
          setTimeout(() => {
            const mockResponse: AuthResponse = {
              user: {
                id: "mock-user-123",
                fullName: "مستخدم تجريبي",
                phone: data.phone,
                isActive: true, // Mock login defaults to active
              },
              token: "mock-jwt-token-xyz",
            };
            setAuthToken(mockResponse.token);
            resolve(mockResponse);
          }, 1500);
        });
      }
      throw error;
    }
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
    try {
      const response = await api.get<AuthResponseEnvelope>("/Auth/Me");
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return mapAuthUser(responseData.data).user;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية جلب بيانات المستخدم."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating mock profile fetch...");
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              id: "mock-user-123",
              fullName: "مستخدم تجريبي",
              phone: "774474895",
              location: "Mukalla",
              isActive: true, // Simulate approved user status in dev fallback
            });
          }, 1200);
        });
      }
      throw error;
    }
  },
};
