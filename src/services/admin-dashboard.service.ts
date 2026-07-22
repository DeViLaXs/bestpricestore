import { api } from "../api/api";
import { ApiResponseEnvelope, AdminDashboardStats } from "../types";

export const adminDashboardService = {
  /**
   * Retrieves administrative summary statistics and metrics displayed on the admin dashboard homepage.
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await api.get<ApiResponseEnvelope<AdminDashboardStats>>("/admin/dashboard");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية استرجاع إحصائيات لوحة التحكم."
    );
  },
};
