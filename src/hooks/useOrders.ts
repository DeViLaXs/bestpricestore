import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import { OrderStatus, OrderSummary, OrderResponseData, CreateOrderRequest } from "../types";

/**
 * Hook to retrieve all order status definitions.
 */
export const useOrderStatusesQuery = () => {
  return useQuery<OrderStatus[], Error>({
    queryKey: ["order-statuses"],
    queryFn: () => orderService.getOrderStatuses(),
    staleTime: 1000 * 60 * 60, // Order statuses are relatively static, cache for 1 hour
  });
};

/**
 * Hook to retrieve the list of orders for the current user.
 */
export const useOrdersQuery = (orderStatusId?: number | null) => {
  return useQuery<OrderSummary[], Error>({
    queryKey: ["orders", orderStatusId],
    queryFn: () => orderService.getOrders(orderStatusId),
  });
};

/**
 * Hook to retrieve details of a specific order.
 */
export const useOrderDetailsQuery = (id: number) => {
  return useQuery<OrderResponseData, Error>({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderDetails(id),
    enabled: !!id,
  });
};

/**
 * Hook to cancel a pending order.
 */
export const useCancelOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponseData, Error, number>({
    mutationFn: (id) => orderService.cancelOrder(id),
    onSuccess: (data, id) => {
      // Invalidate the orders list and this specific order's details
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
  });
};

/**
 * Hook to place a new order.
 */
export const usePlaceOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<OrderResponseData, Error, CreateOrderRequest>({
    mutationFn: (data) => orderService.placeOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
