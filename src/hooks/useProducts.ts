import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { productService } from "../services/product.service";
import {
  Currency,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  BrowseProductsResponse,
  LatestProduct,
  TopSellingProduct,
} from "../types";

/**
 * Hook to retrieve the list of currencies.
 */
export const useCurrenciesQuery = () => {
  return useQuery<Currency[], Error>({
    queryKey: ["currencies"],
    queryFn: () => productService.getCurrencies(),
  });
};

/**
 * Hook to create a new product.
 */
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProductRequest>({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      // Invalidate products query cache if list exists
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

/**
 * Hook to upload an image.
 */
export const useUploadImageMutation = () => {
  return useMutation<string, Error, string>({
    mutationFn: (fileUri) => productService.uploadImage(fileUri),
  });
};

/**
 * Hook to retrieve products list.
 */
export const useProductsQuery = (params?: { search?: string; categoryId?: number }) => {
  return useQuery<Product[], Error>({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
  });
};

/**
 * Hook to retrieve products list with infinite pagination, filtering, and search.
 */
export const useInfiniteProductsQuery = (params?: {
  search?: string;
  categoryId?: number;
  pageSize?: number;
}) => {
  return useInfiniteQuery<BrowseProductsResponse, Error>({
    queryKey: ["products-infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      productService.browseProducts({
        ...params,
        pageNumber: pageParam as number,
        pageSize: params?.pageSize || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.pageNumber + 1 : undefined;
    },
    placeholderData: keepPreviousData,
  });
};

/**
 * Hook to retrieve details of a specific product.
 */
export const useProductQuery = (id: number) => {
  return useQuery<Product, Error>({
    queryKey: ["product", id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id,
  });
};

/**
 * Helper to invalidate all product-related cache queries.
 */
const invalidateAllProductQueries = (queryClient: ReturnType<typeof useQueryClient>, id?: number) => {
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
  queryClient.invalidateQueries({ queryKey: ["products-latest"] });
  queryClient.invalidateQueries({ queryKey: ["products-top-selling"] });
  if (id) {
    queryClient.invalidateQueries({ queryKey: ["product", id] });
  }
};

/**
 * Hook to update an existing product.
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: number; data: UpdateProductRequest }>({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      invalidateAllProductQueries(queryClient, variables.id);
    },
  });
};

/**
 * Hook to activate a product.
 */
export const useActivateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => productService.activateProduct(id),
    onSuccess: (_, id) => {
      invalidateAllProductQueries(queryClient, id);
    },
  });
};

/**
 * Hook to deactivate a product.
 */
export const useDeactivateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => productService.deactivateProduct(id),
    onSuccess: (_, id) => {
      invalidateAllProductQueries(queryClient, id);
    },
  });
};

/**
 * Hook to soft-delete a product.
 */
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => productService.deleteProduct(id),
    onSuccess: (_, id) => {
      invalidateAllProductQueries(queryClient, id);
    },
  });
};

/**
 * Hook to fetch product details lazily/imperatively in event handlers.
 */
export const useGetProductDetails = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (id: number) =>
      queryClient.fetchQuery<Product, Error>({
        queryKey: ["product", id],
        queryFn: () => productService.getProduct(id),
      }),
    [queryClient]
  );
};

/**
 * Hook to retrieve latest active products widget.
 */
export const useLatestProductsQuery = () => {
  return useQuery<LatestProduct[], Error>({
    queryKey: ["products-latest"],
    queryFn: () => productService.getLatestProducts(),
  });
};

/**
 * Hook to retrieve top selling products widget.
 */
export const useTopSellingProductsQuery = () => {
  return useQuery<TopSellingProduct[], Error>({
    queryKey: ["products-top-selling"],
    queryFn: () => productService.getTopSellingProducts(),
  });
};
