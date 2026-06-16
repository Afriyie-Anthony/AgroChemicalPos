import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../api/services/customerService';

const CUSTOMERS_KEY = ['customers'];

export const useCustomers = () => {
  return useQuery({
    queryKey: CUSTOMERS_KEY,
    queryFn: () => customerService.getAll().then((r) => r.data),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customerService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
};

export const useAdjustCredit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.adjustCredit(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
};

export const useRecordRepayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => customerService.recordRepayment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY }),
  });
};
