import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import { Representative, UserActionResponse, UpdateProfileRequest } from "../types";

/**
 * Hook to retrieve the list of representatives.
 */
export const useRepresentativesQuery = (search?: string) => {
  return useQuery<Representative[], Error>({
    queryKey: ["representatives", search],
    queryFn: () => userService.getRepresentatives(search),
  });
};

/**
 * Hook to approve/activate a representative's account.
 */
export const useApproveRepresentativeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UserActionResponse, Error, number | string>({
    mutationFn: (id) => userService.approveUser(id),
    onSuccess: () => {
      // Invalidate the representatives list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["representatives"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

/**
 * Hook to suspend/deactivate a representative's account.
 */
export const useSuspendRepresentativeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UserActionResponse, Error, number | string>({
    mutationFn: (id) => userService.suspendUser(id),
    onSuccess: () => {
      // Invalidate the representatives list to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ["representatives"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
};

/**
 * Hook to update the current user's profile details.
 */
export const useUpdateProfileMutation = () => {
  return useMutation<UserActionResponse, Error, UpdateProfileRequest>({
    mutationFn: (data) => userService.updateProfile(data),
  });
};
