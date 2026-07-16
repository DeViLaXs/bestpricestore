import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminOrderService, AdminOrderSummary } from "../services/admin-order.service";
import { OrderResponseData } from "../services/order.service";

/**
 * Hook to retrieve all user orders for admin.
 */
export const useAdminOrdersQuery = () => {
  return useQuery<AdminOrderSummary[], Error>({
    queryKey: ["admin-orders"],
    queryFn: () => adminOrderService.getAdminOrders(),
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
    mutationFn: ({ id, orderStatusId }) => adminOrderService.updateAdminOrderStatus(id, orderStatusId),
    onSuccess: (data, variables) => {
      // Invalidate both admin-orders list and details of this specific order
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-order", variables.id] });
      // Also invalidate user queries if they share cache keys (e.g. orders, order)
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
};
