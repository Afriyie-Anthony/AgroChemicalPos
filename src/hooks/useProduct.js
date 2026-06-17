import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/services/productService';
import { useStore } from '../store/useStore';

export const useProductList = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await productService.getAll();
      return data.data; // Assumes response is { success: true, data: [...] }
    }
  });
};

export const useProductDetails = (id) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const data = await productService.getById(id);
      return data.data;
    },
    enabled: !!id
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: (data) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Product created successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to create product.', 'error', 'Error');
    }
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: ({ id, data }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Product updated successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to update product.', 'error', 'Error');
    }
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: ({ id, data }) => productService.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Stock adjusted successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to adjust stock.', 'error', 'Error');
    }
  });
};
