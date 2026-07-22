import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";
import { RegisterRequest, LoginRequest, AuthResponse } from "../types";

export const getErrorMessage = (
  error: any,
  defaultMsg: string = "حدث خطأ ما. يرجى المحاولة مرة أخرى."
) => {
  if (!error) return null;

  // 1. Check response status codes first
  const status = error.response?.status;
  if (status === 401) {
    return "رقم الجوال أو كلمة المرور غير صحيحة.";
  }
  if (status === 403) {
    return "ليس لديك الصلاحية الكافية للقيام بهذا الإجراء.";
  }
  if (status === 404) {
    return "الخدمة أو الصفحة المطلوبة غير موجودة.";
  }
  if (status >= 500) {
    return "حدث خطأ في خادم النظام. يرجى المحاولة مرة أخرى لاحقاً.";
  }

  // 2. Extract message from error
  let message = "";
  if (error.response?.data?.errors) {
    if (Array.isArray(error.response.data.errors)) {
      message = error.response.data.errors.join("\n");
    } else {
      message = String(error.response.data.errors);
    }
  } else {
    message = error.response?.data?.message || error.message || "";
  }

  // 3. Translate common English errors to friendly Arabic
  if (message) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("invalid phone number or password")) {
      return "رقم الجوال أو كلمة المرور غير صحيحة.";
    }
    if (lowerMsg.includes("passwords do not match")) {
      return "كلمات المرور غير متطابقة.";
    }
    if (lowerMsg.includes("already taken")) {
      return "اسم المتجر أو رقم الجوال مستخدم بالفعل.";
    }
    if (lowerMsg.includes("network error") || error.code === "ERR_NETWORK") {
      return "فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.";
    }
    return message;
  }

  return defaultMsg;
};

export type AppRole = "admin" | "representative" | null;

export const getUserRole = (user: { role?: string | string[] } | null | undefined): AppRole => {
  if (!user) return null;

  const roles = Array.isArray(user.role)
    ? user.role
    : String(user.role || "")
        .split(",")
        .map((role) => role.trim());

  if (roles.some((role) => role.toLowerCase() === "admin")) {
    return "admin";
  }

  if (roles.some((role) => role.toLowerCase() === "representative")) {
    return "representative";
  }

  return null;
};

export const checkIsAdmin = (
  user: { role?: string | string[]; fullName?: string; phone?: string } | null | undefined
): boolean => getUserRole(user) === "admin";

export const checkIsRepresentative = (
  user: { role?: string | string[] } | null | undefined
): boolean => getUserRole(user) === "representative";

/**
 * Custom hook to consume the Zustand auth store and React Query mutations.
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const logout = useAuthStore((state) => state.logout);

  const role = getUserRole(user);
  const isAdmin = role === "admin";
  const isRepresentative = role === "representative";

  // Register mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (data) => authService.register(data),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
    },
  });

  // Me status check mutation
  const meMutation = useMutation<AuthResponse["user"], Error, void>({
    mutationFn: () => authService.me(),
    onSuccess: (userData) => {
      setUser(userData);
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin,
    isRepresentative,
    registerMutation,
    loginMutation,
    logoutMutation,
    meMutation,
  };
};
