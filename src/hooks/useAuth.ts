import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authService, RegisterRequest, LoginRequest, AuthResponse } from "../services/auth.service";

export const getErrorMessage = (
  error: any,
  defaultMsg: string = "حدث خطأ ما. يرجى المحاولة مرة أخرى."
) => {
  if (!error) return null;
  if (error.response?.data?.errors) {
    if (Array.isArray(error.response.data.errors)) {
      return error.response.data.errors.join("\n");
    }
    return String(error.response.data.errors);
  }
  return error.response?.data?.message || error.message || defaultMsg;
};

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
    registerMutation,
    loginMutation,
    logoutMutation,
    meMutation,
  };
};
