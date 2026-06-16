import { useQuery } from '@tanstack/react-query';
import { reportService } from '../api/services/reportService';

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => reportService.getSummary().then((r) => r.data),
    refetchInterval: 60000, // auto-refresh every 60s
  });
};

export const useSalesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'sales', params],
    queryFn: () => reportService.getSales(params).then((r) => r.data),
    enabled: !!params,
  });
};

export const useInventoryReport = () => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: () => reportService.getInventory().then((r) => r.data),
  });
};

export const useExpensesReport = (params) => {
  return useQuery({
    queryKey: ['reports', 'expenses', params],
    queryFn: () => reportService.getExpenses(params).then((r) => r.data),
    enabled: !!params,
  });
};

export const useProfitLoss = (params) => {
  return useQuery({
    queryKey: ['reports', 'profit-loss', params],
    queryFn: () => reportService.getProfitLoss(params).then((r) => r.data),
    enabled: !!params,
  });
};
