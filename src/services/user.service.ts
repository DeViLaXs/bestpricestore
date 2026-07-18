import { api } from "../api/api";
import { Representative, UserActionResponse, UpdateProfileRequest, ApiResponseEnvelope } from "../types";

export const userService = {
  /**
   * Updates the current user's profile details
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserActionResponse> {
    try {
      const response = await api.patch<ApiResponseEnvelope<UserActionResponse>>("/Users/profile", {
        storeName: data.storeName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        location: data.location.trim(),
      });
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        return responseData.data;
      } else {
        throw new Error(
          responseData.errors && responseData.errors.length > 0
            ? responseData.errors.join("\n")
            : "فشلت عملية تحديث البيانات الشخصية."
        );
      }
    } catch (error: any) {
      if (__DEV__ && (!error.response || error.code === "ERR_NETWORK")) {
        console.warn("Backend server not reachable. Simulating successful mock profile update...");
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              message: "Profile has been successfully updated.",
            });
          }, 1000);
        });
      }
      throw error;
    }
  },

  /**
   * Retrieves all representatives from the backend
   */
  async getRepresentatives(): Promise<Representative[]> {
    const response = await api.get<ApiResponseEnvelope<Representative[]>>("/Users/representatives");
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
    const response = await api.post<ApiResponseEnvelope<UserActionResponse>>(`/Users/${id}/approve`);
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
    const response = await api.post<ApiResponseEnvelope<UserActionResponse>>(`/Users/${id}/suspend`);
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
