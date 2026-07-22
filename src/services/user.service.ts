import { api } from "../api/api";
import {
  Representative,
  UserActionResponse,
  UpdateProfileRequest,
  ApiResponseEnvelope,
} from "../types";

export const userService = {
  /**
   * Updates the current user's profile details
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserActionResponse> {
    const response = await api.patch<ApiResponseEnvelope<UserActionResponse>>("/Users/profile", {
      storeName: data.storeName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      location: data.location.trim(),
    });
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية تحديث البيانات الشخصية."
    );
  },

  /**
   * Retrieves all representatives from the backend
   */
  async getRepresentatives(search?: string): Promise<Representative[]> {
    const url = search
      ? `/Users/representatives?search=${encodeURIComponent(search)}`
      : "/Users/representatives";
    const response = await api.get<ApiResponseEnvelope<Representative[]>>(url);
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية جلب المندوبين."
    );
  },

  /**
   * Approves/activates a representative
   */
  async approveUser(id: number | string): Promise<UserActionResponse> {
    const response = await api.post<ApiResponseEnvelope<UserActionResponse>>(
      `/Users/${id}/approve`
    );
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية تفعيل المندوب."
    );
  },

  /**
   * Suspends/deactivates a representative
   */
  async suspendUser(id: number | string): Promise<UserActionResponse> {
    const response = await api.post<ApiResponseEnvelope<UserActionResponse>>(
      `/Users/${id}/suspend`
    );
    const responseData = response.data;
    if (responseData.success && responseData.data) {
      return responseData.data;
    }
    throw new Error(
      responseData.errors && responseData.errors.length > 0
        ? responseData.errors.join("\n")
        : "فشلت عملية إلغاء تفعيل المندوب."
    );
  },
};
