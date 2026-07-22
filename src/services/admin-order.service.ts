import { api } from "../api/api";
import {
  ApiResponseEnvelope,
  OrderResponseData,
  AdminOrderSummary,
  EditOrderItemInput,
} from "../types";

export const adminOrderService = {
  /**
   * Retrieves a summary list of all orders in the system.
   */
  async getAdminOrders(search?: string, orderStatusId?: number): Promise<AdminOrderSummary[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (orderStatusId) params.append("orderStatusId", orderStatusId.toString());
    const queryString = params.toString();
    const url = queryString ? `/admin/orders?${queryString}` : "/admin/orders";

    const response = await api.get<ApiResponseEnvelope<AdminOrderSummary[]>>(url);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية استرجاع قائمة طلبات المسؤول."
    );
  },

  /**
   * Retrieves complete product item details for any order by ID.
   */
  async getAdminOrderDetails(id: number): Promise<OrderResponseData> {
    const response = await api.get<ApiResponseEnvelope<OrderResponseData>>(`/admin/orders/${id}`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية استرجاع تفاصيل طلب المسؤول."
    );
  },

  /**
   * Updates the status of an order (terminal checks and transition rules applied).
   */
  async updateAdminOrderStatus(id: number, orderStatusId: number): Promise<OrderResponseData> {
    const response = await api.put<ApiResponseEnvelope<OrderResponseData>>(
      `/admin/orders/${id}/status`,
      {
        orderStatusId,
      }
    );
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية تحديث حالة الطلب."
    );
  },

  /**
   * Updates the items and quantities of an order (for returns or reductions).
   */
  async editAdminOrderItems(id: number, items: EditOrderItemInput[]): Promise<OrderResponseData | null> {
    const response = await api.put<ApiResponseEnvelope<OrderResponseData | null>>(
      `/admin/orders/${id}/items`,
      {
        items,
      }
    );
    const responseData = response.data;
    if (responseData.success) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية تعديل عناصر الطلب."
    );
  },
};
