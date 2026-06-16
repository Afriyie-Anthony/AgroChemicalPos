import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../api/services/transactionService';

const TRANSACTIONS_KEY = ['transactions'];

export const useTransactions = (params) => {
  return useQuery({
    queryKey: [...TRANSACTIONS_KEY, params],
    queryFn: () => transactionService.getAll(params).then((r) => r.data),
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.checkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });    // stock deducted
      queryClient.invalidateQueries({ queryKey: ['customers'] });   // credit/loyalty updated
    },
  });
};

export const useVoidTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => transactionService.voidTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['products'] });    // stock restored
      queryClient.invalidateQueries({ queryKey: ['customers'] });   // credit reversed
    },
  });
};
