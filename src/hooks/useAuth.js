import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/services/authService';
import { useStore } from '../store/useStore';

export const useLogin = () => {
  const { setCurrentUser } = useStore();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      localStorage.setItem('agrochem_token', data.token);
      setCurrentUser(data.user);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      localStorage.setItem('agrochem_token', data.token);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
  });
};

export const useLogout = () => {
  const { clearCurrentUser } = useStore();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem('agrochem_token');
    clearCurrentUser();
    queryClient.clear();
  };
};
