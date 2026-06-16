import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../api/services/staffService';

const STAFF_KEY = ['staff'];

export const useStaff = () => {
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: () => staffService.getAll().then((r) => r.data),
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: staffService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => staffService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};

export const useDeactivateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => staffService.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
};
