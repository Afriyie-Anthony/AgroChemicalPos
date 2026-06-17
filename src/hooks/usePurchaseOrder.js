import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '../api/services/purchaseOrderService';
import { useStore } from '../store/useStore';

export const usePurchaseOrderList = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const data = await purchaseOrderService.getAll();
      return data.data; // Assuming { success: true, data: [...] }
    }
  });
};

export const usePurchaseOrderDetails = (id) => {
  return useQuery({
    queryKey: ['purchaseOrders', id],
    queryFn: async () => {
      const data = await purchaseOrderService.getById(id);
      return data.data;
    },
    enabled: !!id
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: (data) => purchaseOrderService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      showAlert('Purchase Order created successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to create Purchase Order.', 'error', 'Error');
    }
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: ({ id, data }) => purchaseOrderService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      showAlert('Purchase Order updated successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to update Purchase Order.', 'error', 'Error');
    }
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: ({ id, data }) => purchaseOrderService.receive(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      // Invalidate products because receiving a PO usually creates stock batches!
      queryClient.invalidateQueries({ queryKey: ['products'] });
      showAlert('Purchase Order received successfully. Stock has been updated.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to receive Purchase Order.', 'error', 'Error');
    }
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();
  const { showAlert } = useStore.getState();

  return useMutation({
    mutationFn: (id) => purchaseOrderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      showAlert('Purchase Order deleted successfully.', 'success', 'Success');
    },
    onError: (error) => {
      showAlert(error.response?.data?.message || 'Failed to delete Purchase Order.', 'error', 'Error');
    }
  });
};
