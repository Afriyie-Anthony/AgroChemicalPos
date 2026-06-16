import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderService } from '../api/services/purchaseOrderService';

const PO_KEY = ['purchase-orders'];

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: PO_KEY,
    queryFn: () => purchaseOrderService.getAll().then((r) => r.data),
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseOrderService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PO_KEY }),
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => purchaseOrderService.receive(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PO_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // stock updated
    },
  });
};
