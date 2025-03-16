import { useAuthStore } from '@/stores/zustand/auth.store';

export const useAuth = () => {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  return {
    isAuthenticated,
    user,
    login,
    logout,
  };
}; 