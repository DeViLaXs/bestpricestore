import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import { Category } from "../types";

/**
 * Hook to retrieve the list of categories.
 */
export const useCategoriesQuery = (search?: string) => {
  return useQuery<Category[], Error>({
    queryKey: ["categories", search],
    queryFn: () => categoryService.getCategories(search),
  });
};

/**
 * Hook to create a new category.
 */
export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, string>({
    mutationFn: (name) => categoryService.createCategory(name),
    onSuccess: () => {
      // Invalidate the categories list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Hook to update an existing category.
 */
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { id: number; name: string }>({
    mutationFn: ({ id, name }) => categoryService.updateCategory(id, name),
    onSuccess: () => {
      // Invalidate the categories list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

/**
 * Hook to delete a category.
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      // Invalidate the categories list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
