import { api } from "../api/api";
import { Category, ApiResponseEnvelope } from "../types";

export const categoryService = {
  /**
   * Retrieves all categories from the backend
   */
  async getCategories(search?: string): Promise<Category[]> {
    const response = await api.get<ApiResponseEnvelope<Category[]>>("/Categories", {
      params: search ? { search } : undefined,
    });
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب الفئات."
      );
    }
  },

  /**
   * Creates a new category
   */
  async createCategory(name: string): Promise<Category> {
    try {
      const response = await api.post<ApiResponseEnvelope<Category>>("/Categories", { name });
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية إضافة الفئة."
        );
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        throw new Error(err.response.data.errors.join("\n"));
      }
      throw err;
    }
  },

  /**
   * Updates an existing category
   */
  async updateCategory(id: number, name: string): Promise<Category> {
    try {
      const response = await api.put<ApiResponseEnvelope<Category>>(`/Categories/${id}`, {
        name,
      });
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية تحديث الفئة."
        );
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        throw new Error(err.response.data.errors.join("\n"));
      }
      throw err;
    }
  },

  /**
   * Deletes an existing category
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      const response = await api.delete<ApiResponseEnvelope<{ message: string }>>(
        `/Categories/${id}`
      );
      const responseData = response.data;
      if (!responseData.success) {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية حذف الفئة."
        );
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        throw new Error(err.response.data.errors.join("\n"));
      }
      throw err;
    }
  },
};
