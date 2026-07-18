import { api } from "../api/api";
import { ApiResponseEnvelope, OrderResponseData, AdminOrderSummary } from "../types";

export const adminOrderService = {
  /**
   * Retrieves a summary list of all orders in the system.
   */
  async getAdminOrders(): Promise<AdminOrderSummary[]> {
    try {
      const response = await api.get<ApiResponseEnvelope<AdminOrderSummary[]>>("/admin/orders");
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية استرجاع قائمة طلبات المسؤول."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating mock admin orders...");
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(MOCK_ADMIN_ORDERS);
          }, 800);
        });
      }
      throw error;
    }
  },

  /**
   * Retrieves complete product item details for any order by ID.
   */
  async getAdminOrderDetails(id: number): Promise<OrderResponseData> {
    try {
      const response = await api.get<ApiResponseEnvelope<OrderResponseData>>(`/admin/orders/${id}`);
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية استرجاع تفاصيل طلب المسؤول."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn(`Backend server not reachable. Simulating mock admin order details for ID: ${id}...`);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const order = MOCK_ADMIN_ORDERS.find((o) => o.id === id);
            if (!order) {
              reject(new Error("هذا الطلب غير موجود في النظام."));
            } else {
              resolve({
                id: order.id,
                userId: order.userId,
                orderStatusId: order.orderStatusId,
                totalAmountYer: order.totalAmountYer,
                totalAmountSar: order.totalAmountSar,
                createdAt: order.createdAt,
                items: MOCK_ORDER_ITEMS[id] || [],
              });
            }
          }, 800);
        });
      }
      throw error;
    }
  },

  /**
   * Updates the status of an order (terminal checks and transition rules applied).
   */
  async updateAdminOrderStatus(id: number, orderStatusId: number): Promise<OrderResponseData> {
    try {
      const response = await api.put<ApiResponseEnvelope<OrderResponseData>>(`/admin/orders/${id}/status`, {
        orderStatusId,
      });
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية تحديث حالة الطلب."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn(`Backend server not reachable. Simulating status transition to: ${orderStatusId}...`);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const orderIndex = MOCK_ADMIN_ORDERS.findIndex((o) => o.id === id);
            if (orderIndex === -1) {
              reject(new Error("هذا الطلب غير موجود في النظام."));
              return;
            }

            const order = MOCK_ADMIN_ORDERS[orderIndex];
            const currentStatus = order.orderStatusId;

            // Terminal status check
            if (currentStatus === 4 || currentStatus === 5) {
              reject(new Error("لا يمكن تعديل حالة طلب مكتمل أو ملغى بالفعل."));
              return;
            }

            // Strict sequence checks
            let isValidTransition = false;
            if (currentStatus === 1 && (orderStatusId === 2 || orderStatusId === 5)) {
              isValidTransition = true;
            } else if (currentStatus === 2 && (orderStatusId === 3 || orderStatusId === 5)) {
              isValidTransition = true;
            } else if (currentStatus === 3 && (orderStatusId === 4 || orderStatusId === 5)) {
              isValidTransition = true;
            }

            if (!isValidTransition) {
              reject(
                new Error(
                  `انتقال غير صالح للحالة من ${getStatusName(currentStatus)} إلى ${getStatusName(orderStatusId)}.`
                )
              );
              return;
            }

            // Update status in local memory
            MOCK_ADMIN_ORDERS[orderIndex] = {
              ...order,
              orderStatusId: orderStatusId,
            };

            resolve({
              id: order.id,
              userId: order.userId,
              orderStatusId: orderStatusId,
              totalAmountYer: order.totalAmountYer,
              totalAmountSar: order.totalAmountSar,
              createdAt: order.createdAt,
              items: MOCK_ORDER_ITEMS[id] || [],
            });
          }, 800);
        });
      }
      throw error;
    }
  },
};

// Helper for Arabic status names inside the mock error message
function getStatusName(statusId: number): string {
  switch (statusId) {
    case 1:
      return "قيد المراجعة (1)";
    case 2:
      return "قيد المعالجة (2)";
    case 3:
      return "تم الشحن (3)";
    case 4:
      return "تم التوصيل (4)";
    case 5:
      return "ملغى (5)";
    default:
      return `مجهول (${statusId})`;
  }
}

// Development Mock Data
const MOCK_ADMIN_ORDERS: AdminOrderSummary[] = [
  {
    id: 11,
    orderStatusId: 1,
    totalAmountYer: 1200.0,
    totalAmountSar: 250.0,
    createdAt: "2026-07-16T19:20:29.303Z",
    userId: 21,
    storeName: "متجر الوفاء بالتجزئة",
  },
  {
    id: 10,
    orderStatusId: 2,
    totalAmountYer: 0.0,
    totalAmountSar: 500.0,
    createdAt: "2026-07-16T19:19:34.417Z",
    userId: 19,
    storeName: "متجر البركة التجاري",
  },
  {
    id: 9,
    orderStatusId: 3,
    totalAmountYer: 2400.0,
    totalAmountSar: 0.0,
    createdAt: "2026-07-15T15:30:00.000Z",
    userId: 21,
    storeName: "متجر الوفاء بالتجزئة",
  },
  {
    id: 8,
    orderStatusId: 4,
    totalAmountYer: 4500.0,
    totalAmountSar: 120.0,
    createdAt: "2026-07-14T10:15:00.000Z",
    userId: 25,
    storeName: "متجر الياسمين للمواد الغذائية",
  },
  {
    id: 7,
    orderStatusId: 5,
    totalAmountYer: 0.0,
    totalAmountSar: 350.0,
    createdAt: "2026-07-13T12:00:00.000Z",
    userId: 19,
    storeName: "متجر البركة التجاري",
  },
];

const MOCK_ORDER_ITEMS: Record<number, any[]> = {
  11: [
    {
      productId: 1,
      productName: "وساده مريحه للنوم",
      productImageId: 1,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
      quantity: 1,
      unitPrice: 1200.0,
      totalAmount: 1200.0,
      currencyId: 1,
    },
    {
      productId: 2,
      productName: "سماعات رأس لاسلكية متميزة",
      productImageId: 5,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg",
      quantity: 1,
      unitPrice: 250.0,
      totalAmount: 250.0,
      currencyId: 2,
    },
  ],
  10: [
    {
      productId: 3,
      productName: "ساعة ذكية رياضية مقاومة للماء",
      productImageId: 8,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg",
      quantity: 2,
      unitPrice: 250.0,
      totalAmount: 500.0,
      currencyId: 2,
    },
  ],
  9: [
    {
      productId: 1,
      productName: "وساده مريحه للنوم",
      productImageId: 1,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
      quantity: 2,
      unitPrice: 1200.0,
      totalAmount: 2400.0,
      currencyId: 1,
    },
  ],
  8: [
    {
      productId: 4,
      productName: "شاحن سفري سريع الجودة بقوة 20 واط",
      productImageId: 11,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
      quantity: 1,
      unitPrice: 120.0,
      totalAmount: 120.0,
      currencyId: 2,
    },
    {
      productId: 1,
      productName: "وساده مريحه للنوم",
      productImageId: 1,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/a7242460-ea0f-4abd-89e0-58c00e7cb1bc.jpeg",
      quantity: 3,
      unitPrice: 1500.0,
      totalAmount: 4500.0,
      currencyId: 1,
    },
  ],
  7: [
    {
      productId: 2,
      productName: "سماعات رأس لاسلكية متميزة",
      productImageId: 5,
      imageUrl: "https://pub-4e485becda324bc392c5253fecb937cd.r2.dev/1856aad6-a29d-46a3-91ce-5e0bb919d7b8.jpeg",
      quantity: 1,
      unitPrice: 350.0,
      totalAmount: 350.0,
      currencyId: 2,
    },
  ],
};
