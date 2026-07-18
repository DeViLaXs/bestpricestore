import { api } from "../api/api";
import {
  ApiResponseEnvelope,
  OrderItemInput,
  CreateOrderRequest,
  OrderItemResponse,
  OrderResponseData,
  OrderStatus,
  OrderSummary,
} from "../types";

export const orderService = {
  /**
   * Places a new order on the backend.
   * Validates stock availability, deducts stock, and computes currency totals.
   */
  async placeOrder(data: CreateOrderRequest): Promise<OrderResponseData> {
    const response = await api.post<ApiResponseEnvelope<OrderResponseData>>("/Orders", data);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية إرسال الطلب."
      );
    }
  },

  /**
   * Retrieves all available order status definitions.
   */
  async getOrderStatuses(): Promise<OrderStatus[]> {
    const response = await api.get<ApiResponseEnvelope<OrderStatus[]>>("/OrderStatuses");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية استرجاع حالات الطلبات."
      );
    }
  },

  /**
   * Retrieves a summary list of all orders placed by the currently logged-in user.
   */
  async getOrders(): Promise<OrderSummary[]> {
    const response = await api.get<ApiResponseEnvelope<OrderSummary[]>>("/Orders");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية استرجاع قائمة الطلبات."
      );
    }
  },

  /**
   * Retrieves complete product details for a specific order.
   */
  async getOrderDetails(id: number): Promise<OrderResponseData> {
    const response = await api.get<ApiResponseEnvelope<OrderResponseData>>(`/Orders/${id}`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية استرجاع تفاصيل الطلب."
      );
    }
  },

  /**
   * Cancels a pending order.
   */
  async cancelOrder(id: number): Promise<OrderResponseData> {
    const response = await api.put<ApiResponseEnvelope<OrderResponseData>>(`/Orders/${id}/cancel`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية إلغاء الطلب."
      );
    }
  },
};
