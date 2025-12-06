/**
 * useAdmin Hook
 * Manages admin operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { AdminStatistics, Report, BlockUserRequest, PaginationResponse } from '@/types/api';

interface UseAdminReturn {
  statistics: AdminStatistics | null;
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  fetchStatistics: () => Promise<void>;
  fetchReports: (page?: number) => Promise<void>;
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role?: 'USER' | 'ADMIN';
  }) => Promise<void>;
  updateUser: (userId: string, data: {
    fullName?: string;
    email?: string;
    bio?: string;
    profilePicture?: string;
    role?: 'USER' | 'ADMIN';
  }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  blockUser: (userId: string, data: BlockUserRequest) => Promise<void>;
  deletePost: (postId: string, reason: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  pagination: PaginationResponse | null;
  refresh: () => Promise<void>;
}

export const useAdmin = (): UseAdminReturn => {
  const [statistics, setStatistics] = useState<AdminStatistics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);

  const fetchStatistics = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await api.getAdminStatistics();
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReports = useCallback(async (page = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getReports(page, 10);
      // Backend returns { reports: Report[], pagination: {...} }
      const reportsArray = 'reports' in response ? response.reports : (response as { items: Report[] }).items || [];
      setReports(reportsArray);
      setPagination('pagination' in response ? response.pagination : (response as { pagination: PaginationResponse }).pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.createUserAsAdmin(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, data: {
    fullName?: string;
    email?: string;
    bio?: string;
    profilePicture?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.updateUserAsAdmin(userId, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteUserAsAdmin(userId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const blockUser = useCallback(async (userId: string, data: BlockUserRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.blockUser(userId, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al bloquear usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (postId: string, reason: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deletePostAsAdmin(postId, reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar publicación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteCommentAsAdmin(commentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar comentario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([fetchStatistics(), fetchReports(1)]);
  }, [fetchStatistics, fetchReports]);

  return {
    statistics,
    reports,
    isLoading,
    error,
    fetchStatistics,
    fetchReports,
    createUser,
    updateUser,
    deleteUser,
    blockUser,
    deletePost,
    deleteComment,
    pagination,
    refresh,
  };
};

