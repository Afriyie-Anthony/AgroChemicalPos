import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../api/services/categoryService';

export const useCategoryList = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then(res => res.data),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      // Since renaming a category might affect products later, we could also invalidate products:
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
