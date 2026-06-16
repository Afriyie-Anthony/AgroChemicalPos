import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/services/productService';

const PRODUCTS_KEY = ['products'];

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: () => productService.getAll().then((r) => r.data),
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productService.getOne(id).then((r) => r.data),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useAddBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.addBatch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productService.adjustStock(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
};
