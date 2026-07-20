import { api } from "../api/api";
import {
  Currency,
  ProductImageInput,
  CreateProductRequest,
  UpdateProductImageInput,
  UpdateProductRequest,
  ProductImage,
  Product,
  BrowseProduct,
  BrowseProductsResponse,
  LatestProduct,
  TopSellingProduct,
  ApiResponseEnvelope,
} from "../types";

export const productService = {
  /**
   * Browses active products with pagination, category filter, and search.
   */
  async browseProducts(params?: {
    search?: string;
    categoryId?: number;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<BrowseProductsResponse> {
    const response = await api.get<ApiResponseEnvelope<BrowseProductsResponse>>("/products/browse", { params });
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية تصفح المنتجات."
      );
    }
  },
  /**
   * Fetches supported currencies
   */
  async getCurrencies(): Promise<Currency[]> {
    const response = await api.get<ApiResponseEnvelope<Currency[]>>("/Currencies");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب العملات."
      );
    }
  },

  /**
   * Uploads an image to R2 storage
   */
  async uploadImage(fileUri: string): Promise<string> {
    const formData = new FormData();
    const filename = fileUri.split("/").pop() || "image.jpg";

    // Extract file extension to determine content type
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("file", {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    formData.append("image", {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    const response = await api.post<ApiResponseEnvelope<any>>("/Images/upload", formData, {
      headers: {
        "Content-Type": undefined,
        Accept: "application/json",
      },
    });

    const responseData = response.data;
    if (responseData.success && responseData.data) {
      // If data is a direct string URL
      if (typeof responseData.data === "string") {
        return responseData.data;
      }
      // If data is an object containing url or imageUrl
      if (responseData.data.url) {
        return responseData.data.url;
      }
      if (responseData.data.imageUrl) {
        return responseData.data.imageUrl;
      }
      throw new Error("تنسيق استجابة رفع الصورة غير صالح.");
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية رفع الصورة."
      );
    }
  },

  /**
   * Creates a new product
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await api.post<ApiResponseEnvelope<Product>>("/products", data);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية إضافة المنتج."
      );
    }
  },

  /**
   * Fetches all products with optional filters
   */
  async getProducts(params?: { search?: string; categoryId?: number }): Promise<Product[]> {
    const response = await api.get<ApiResponseEnvelope<Product[]>>("/products", { params });
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب المنتجات."
      );
    }
  },

  /**
   * Fetches detailed info for a single product by ID
   */
  async getProduct(id: number): Promise<Product> {
    const response = await api.get<ApiResponseEnvelope<Product>>(`/products/${id}`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب تفاصيل المنتج."
      );
    }
  },

  /**
   * Updates an existing product
   */
  async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    const response = await api.put<ApiResponseEnvelope<Product>>(`/products/${id}`, data);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية تحديث المنتج."
      );
    }
  },

  /**
   * Activates a product (sets IsActive = true)
   */
  async activateProduct(id: number): Promise<void> {
    const response = await api.put<ApiResponseEnvelope<{ message: string }>>(`/products/${id}/activate`);
    const responseData = response.data;
    if (!responseData.success) {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية تفعيل المنتج."
      );
    }
  },

  /**
   * Deactivates a product (sets IsActive = false)
   */
  async deactivateProduct(id: number): Promise<void> {
    const response = await api.put<ApiResponseEnvelope<{ message: string }>>(`/products/${id}/deactivate`);
    const responseData = response.data;
    if (!responseData.success) {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية إلغاء تفعيل المنتج."
      );
    }
  },

  /**
   * Fetches latest 5 active products widget
   */
  async getLatestProducts(): Promise<LatestProduct[]> {
    const response = await api.get<ApiResponseEnvelope<LatestProduct[]>>("/Products/latest");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب أحدث المنتجات."
      );
    }
  },

  /**
   * Fetches top 10 selling products widget
   */
  async getTopSellingProducts(): Promise<TopSellingProduct[]> {
    const response = await api.get<ApiResponseEnvelope<TopSellingProduct[]>>("/Products/top-selling");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب المنتجات الأكثر مبيعاً."
      );
    }
  },
};
