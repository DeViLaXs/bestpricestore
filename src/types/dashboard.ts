/**
 * Model representing the payload returned by GET /api/admin/dashboard
 */
export interface AdminDashboardStats {
  totalSalesYer: number;
  totalSalesSar: number;
  totalOrders: number;
  pendingOrdersCount: number;
  processingOrdersCount: number;
  shippedOrdersCount: number;
  deliveredOrdersCount: number;
  cancelledOrdersCount: number;
  totalActiveProducts: number;
  outOfStockProductsCount: number;
  totalRepresentatives: number;
  activeRepresentatives: number;
}
