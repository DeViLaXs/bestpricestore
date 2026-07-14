import { api, setAuthToken } from "../api/api";

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

export interface ApiResponseEnvelope {
  statusCode: number;
  success: boolean;
  data: {
    id?: number | string;
    token: string;
    storeName: string;
    phoneNumber: string;
    location?: string;
    isActive?: boolean;
    role?: string;
  } | null;
  errors: string[] | null;
}

export const authService = {
  /**
   * Registers a new user with full name, phone number, and password.
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponseEnvelope>("/Auth/Register", {
        StoreName: data.storeName.trim(),
        PhoneNumber: data.phone,
        Password: data.password,
        PasswordConfirmation: data.confirmPassword || data.password,
        Location: data.location || "",
      });

      const responseData = response.data;
      if (responseData.success && responseData.data) {
        const { token, storeName, phoneNumber, location, isActive, role } = responseData.data;
        if (token) {
          setAuthToken(token);
        }

        return {
          user: {
            id: String(responseData.data.id || storeName),
            fullName: storeName,
            phone: phoneNumber,
            location: location || "",
            isActive: isActive ?? false,
            role: role || "",
          },
          token: token,
        };
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
      const response = await api.post<ApiResponseEnvelope>("/Auth/Login", {
        PhoneNumber: data.phone,
        Password: data.password,
      });

      const responseData = response.data;
      if (responseData.success && responseData.data) {
        const { token, storeName, phoneNumber, location, isActive, role } = responseData.data;
        if (token) {
          setAuthToken(token);
        }

        return {
          user: {
            id: String(responseData.data.id || storeName),
            fullName: storeName,
            phone: phoneNumber,
            location: location || "",
            isActive: isActive ?? false,
            role: role || "",
          },
          token: token,
        };
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
      const response = await api.get<ApiResponseEnvelope>("/Auth/Me");
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        const { storeName, phoneNumber, location, isActive, role } = responseData.data;
        return {
          id: String(responseData.data.id || storeName),
          fullName: storeName,
          phone: phoneNumber,
          location: location || "",
          isActive: isActive ?? false,
          role: role || "",
        };
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
