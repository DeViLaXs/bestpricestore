import { api } from "../api/api";
import { ApiResponseEnvelope, AdminDashboardStats } from "../types";

export const adminDashboardService = {
  /**
   * Retrieves administrative summary statistics and metrics displayed on the admin dashboard homepage.
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const response = await api.get<ApiResponseEnvelope<AdminDashboardStats>>("/admin/dashboard");
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية استرجاع إحصائيات لوحة التحكم."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating mock admin dashboard stats...");
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(MOCK_DASHBOARD_STATS);
          }, 800);
        });
      }
      throw error;
    }
  },
};

// Mock data matching doc/AdminDashboard_API_Docs.md for development offline fallback
const MOCK_DASHBOARD_STATS: AdminDashboardStats = {
  totalSalesYer: 356000.0,
  totalSalesSar: 1000.0,
  totalOrders: 17,
  pendingOrdersCount: 1,
  processingOrdersCount: 0,
  shippedOrdersCount: 0,
  deliveredOrdersCount: 7,
  cancelledOrdersCount: 9,
  totalActiveProducts: 3,
  outOfStockProductsCount: 1,
  totalRepresentatives: 20,
  activeRepresentatives: 7,
};
