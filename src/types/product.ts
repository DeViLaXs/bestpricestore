export interface Currency {
  id: number;
  name: string;
}

export interface ProductImageInput {
  imageUrl: string;
  quantityInStock: number;
  isPrimary?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  currencyId: number;
  categoryId: number;
  images: ProductImageInput[];
}

export interface UpdateProductImageInput {
  id?: number;
  imageUrl: string;
  quantityInStock: number;
  isPrimary?: boolean;
}

export interface UpdateProductRequest {
  name: string;
  description?: string;
  price: number;
  currencyId: number;
  categoryId: number;
  images: UpdateProductImageInput[];
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  quantityInStock: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currencyId: number;
  currencyName: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  images: ProductImage[];
}

export interface BrowseProduct {
  id: number;
  name: string;
  price: number;
  currencyId: number;
  primaryImageUrl: string;
  categoryId?: number;
  categoryName?: string;
}

export interface BrowseProductsResponse {
  items: BrowseProduct[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface LatestProduct {
  id: number;
  name: string;
  price: number;
  currencyId: number;
  primaryImageUrl?: string;
}

export interface TopSellingProduct {
  id: number;
  name: string;
  price: number;
  currencyId: number;
  primaryImageUrl?: string;
  totalQuantitySold: number;
}
