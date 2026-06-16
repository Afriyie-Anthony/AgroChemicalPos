import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../api/services/settingsService';

const SETTINGS_KEY = ['settings'];

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => settingsService.get().then((r) => r.data),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SETTINGS_KEY }),
  });
};
