import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOrderService } from "../services/admin-order.service";
import { AdminOrderSummary, OrderResponseData, EditOrderItemInput } from "../types";

/**
 * Hook to retrieve all user orders for admin.
 */
export const useAdminOrdersQuery = (search?: string, orderStatusId?: number) => {
  return useQuery<AdminOrderSummary[], Error>({
    queryKey: ["admin-orders", search, orderStatusId],
    queryFn: () => adminOrderService.getAdminOrders(search, orderStatusId),
  });
};

/**
 * Hook to retrieve details of any specific order for admin.
 */
export const useAdminOrderDetailsQuery = (id: number) => {
  return useQuery<OrderResponseData, Error>({
    queryKey: ["admin-order", id],
    queryFn: () => adminOrderService.getAdminOrderDetails(id),
    enabled: !!id,
  });
};

/**
 * Hook to update an order's status by admin.
 */
export const useAdminUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponseData, Error, { id: number; orderStatusId: number }>({
    mutationFn: ({ id, orderStatusId }) =>
      adminOrderService.updateAdminOrderStatus(id, orderStatusId),
    onSuccess: (data, variables) => {
      // Invalidate both admin-orders list and details of this specific order
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.id] });
      // Invalidate admin-dashboard to refresh count stats
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      // Also invalidate user queries if they share cache keys (e.g. orders, order)
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};

/**
 * Hook to edit order items / process returns by admin.
 */
export const useAdminEditOrderItemsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponseData | null, Error, { id: number; items: EditOrderItemInput[] }>({
    mutationFn: ({ id, items }) => adminOrderService.editAdminOrderItems(id, items),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};
