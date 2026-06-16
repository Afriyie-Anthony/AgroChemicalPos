import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '../api/services/supplierService';

const SUPPLIERS_KEY = ['suppliers'];

export const useSuppliers = () => {
  return useQuery({
    queryKey: SUPPLIERS_KEY,
    queryFn: () => supplierService.getAll().then((r) => r.data),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supplierService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => supplierService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => supplierService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_KEY }),
  });
};
