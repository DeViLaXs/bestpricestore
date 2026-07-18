export interface OrderItemInput {
  productImageId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  productImageId: number;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currencyId: number;
}

export interface OrderResponseData {
  id: number;
  userId: number;
  orderStatusId: number;
  totalAmountYer: number;
  totalAmountSar: number;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderStatus {
  id: number;
  name: string;
}

export interface OrderSummary {
  id: number;
  orderStatusId: number;
  totalAmountYer: number;
  totalAmountSar: number;
  createdAt: string;
}

export interface AdminOrderSummary {
  id: number;
  orderStatusId: number;
  totalAmountYer: number;
  totalAmountSar: number;
  createdAt: string;
  userId: number;
  storeName: string;
}
