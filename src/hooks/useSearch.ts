/**
 * useSearch Hook
 * Manages search state and operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { User, Post, Pet } from '@/types/api';

interface UseSearchReturn {
  users: User[];
  posts: Post[];
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, type?: 'users' | 'pets' | 'posts' | 'all') => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearResults = useCallback((): void => {
    setUsers([]);
    setPosts([]);
    setPets([]);
    setError(null);
  }, []);

  const search = useCallback(async (
    query: string,
    type: 'users' | 'pets' | 'posts' | 'all' = 'all'
  ): Promise<void> => {
    if (!query.trim()) {
      clearResults();
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.search({ query, type, page: 1, limit: 20 });
      setUsers(response.users || []);
      setPosts(response.posts || []);
      setPets(response.pets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
    } finally {
      setIsLoading(false);
    }
  }, [clearResults]);

  const searchUsers = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.searchUsers(query, 1, 20);
      setUsers(response.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPosts = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) {
      setPosts([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.searchPosts(query, 1, 20);
      setPosts(response.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    posts,
    pets,
    isLoading,
    error,
    search,
    searchUsers,
    searchPosts,
    clearResults,
  };
};

