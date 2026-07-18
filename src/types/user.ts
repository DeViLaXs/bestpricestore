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

export interface UpdateProfileRequest {
  storeName: string;
  phoneNumber: string;
  location: string;
}
