import { api } from "../api/api";

export interface Category {
  id: number;
  name: string;
}

export interface CategoryResponseEnvelope<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: string[] | null;
}

export const categoryService = {
  /**
   * Retrieves all categories from the backend
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get<CategoryResponseEnvelope<Category[]>>("/Categories");
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
    const response = await api.post<CategoryResponseEnvelope<Category>>("/Categories", { name });
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
  },

  /**
   * Updates an existing category
   */
  async updateCategory(id: number, name: string): Promise<Category> {
    const response = await api.put<CategoryResponseEnvelope<Category>>(`/Categories/${id}`, {
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
  },

  /**
   * Deletes an existing category
   */
  async deleteCategory(id: number): Promise<void> {
    const response = await api.delete<CategoryResponseEnvelope<{ message: string }>>(
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
  },
};
