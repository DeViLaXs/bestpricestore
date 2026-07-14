import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, Representative, UserActionResponse } from "../services/user.service";

/**
 * Hook to retrieve the list of representatives.
 */
export const useRepresentativesQuery = () => {
  return useQuery<Representative[], Error>({
    queryKey: ["representatives"],
    queryFn: () => userService.getRepresentatives(),
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
    },
  });
};
