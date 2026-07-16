import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  productService,
  Currency,
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  BrowseProductsResponse,
} from "../services/product.service";

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
export const useInfiniteProductsQuery = (params?: { search?: string; categoryId?: number; pageSize?: number }) => {
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
 * Hook to update an existing product.
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, { id: number; data: UpdateProductRequest }>({
    mutationFn: ({ id, data }) => productService.updateProduct(id, data),
    onSuccess: (data, variables) => {
      // Invalidate products list cache
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Invalidate individual product cache
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
  });
};
