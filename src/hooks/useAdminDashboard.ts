import { useQuery } from "@tanstack/react-query";
import { adminDashboardService } from "../services/admin-dashboard.service";
import { AdminDashboardStats } from "../types";

/**
 * Hook to retrieve summary statistics and metrics for the admin dashboard.
 */
export const useAdminDashboardQuery = () => {
  return useQuery<AdminDashboardStats, Error>({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminDashboardService.getDashboardStats(),
  });
};
