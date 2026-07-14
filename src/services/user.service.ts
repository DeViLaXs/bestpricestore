import { api } from "../api/api";

export interface Representative {
  id: number;
  storeName: string;
  phoneNumber: string;
  location: string;
  isActive: boolean;
}

export interface UserActionResponse {
  message: string;
}

export interface RepresentativesResponseEnvelope {
  statusCode: number;
  success: boolean;
  data: Representative[];
  errors: string[] | null;
}

export interface UserActionResponseEnvelope {
  statusCode: number;
  success: boolean;
  data: UserActionResponse;
  errors: string[] | null;
}

export const userService = {
  /**
   * Retrieves all representatives from the backend
   */
  async getRepresentatives(): Promise<Representative[]> {
    const response = await api.get<RepresentativesResponseEnvelope>("/Users/representatives");
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية جلب المندوبين."
      );
    }
  },

  /**
   * Approves/activates a representative
   */
  async approveUser(id: number | string): Promise<UserActionResponse> {
    const response = await api.post<UserActionResponseEnvelope>(`/Users/${id}/approve`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية تفعيل المندوب."
      );
    }
  },

  /**
   * Suspends/deactivates a representative
   */
  async suspendUser(id: number | string): Promise<UserActionResponse> {
    const response = await api.post<UserActionResponseEnvelope>(`/Users/${id}/suspend`);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    } else {
      throw new Error(
        responseData.errors && responseData.errors.length > 0
          ? responseData.errors.join("\n")
          : "فشلت عملية إلغاء تفعيل المندوب."
      );
    }
  },
};
