import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export const useUpdateProfile = () => {
  const { setCurrentUser } = useStore();
  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      setCurrentUser(data.user);
    },
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


// Rehydrates auth state from token on page refresh
export const useInitAuth = () => {
  const { setCurrentUser, isAuthenticated } = useStore();
  const token = localStorage.getItem('agrochem_token');

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe().then((r) => r.user),
    enabled: !!token && !isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setCurrentUser(query.data);
    } else if (query.isError) {
      // Token is invalid/expired — clear it
      localStorage.removeItem('agrochem_token');
    }
  }, [query.isSuccess, query.isError, query.data, setCurrentUser]);

  // We are initializing if we have a token, we aren't authenticated yet, and the query hasn't failed
  const isInitializing = !!token && !isAuthenticated && !query.isError;

  return { isInitializing };
};
