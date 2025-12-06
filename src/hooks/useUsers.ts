/**
 * useUsers Hook
 * Manages users list and operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User, PaginationResponse } from '@/types/api';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationResponse | null;
  fetchUsers: (page?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  const fetchUsers = useCallback(async (page = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      // Nota: El backend no tiene un endpoint /admin/users, necesitaríamos crearlo
      // Por ahora usamos searchUsers con query vacío para obtener todos
      const response = await api.searchUsers('', page, 20);
      setUsers(response.users || []);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchUsers(1);
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    refresh,
  };
};



