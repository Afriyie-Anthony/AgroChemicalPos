import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseService } from '../api/services/expenseService';

const EXPENSES_KEY = ['expenses'];

export const useExpenses = (params) => {
  return useQuery({
    queryKey: [...EXPENSES_KEY, params],
    queryFn: () => expenseService.getAll(params).then((r) => r.data),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => expenseService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => expenseService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
};
