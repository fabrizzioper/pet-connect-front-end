/**
 * usePosts Hook
 * Manages posts state and operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Post, CreatePostRequest } from '@/types/api';

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  fetchFeed: (page?: number) => Promise<void>;
  createPost: (data: CreatePostRequest) => Promise<Post>;
  toggleLike: (postId: string) => Promise<void>;
  reportPost: (postId: string, reason: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const usePosts = (): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(async (pageNum = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getFeed(pageNum, 10);
      if (pageNum === 1) {
        setPosts(response.posts);
      } else {
        setPosts((prev) => [...prev, ...response.posts]);
      }
      setPage(pageNum);
      setHasMore(response.pagination.page < response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar publicaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: CreatePostRequest): Promise<Post> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.createPost(data);
      if (response.data) {
        setPosts((prev) => [response.data as Post, ...prev]);
        return response.data;
      }
      throw new Error('No se recibió la publicación creada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear publicación';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    try {
      await api.toggleLike(postId);
      setPosts((prev) =>
        prev.map((post) => {
          if (post._id === postId) {
            const isLiked = post.isLiked ?? false;
            const currentLikes = post.likesCount ?? 0;
            return {
              ...post,
              isLiked: !isLiked,
              likesCount: isLiked ? currentLikes - 1 : currentLikes + 1,
            };
          }
          return post;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al dar like');
    }
  }, []);

  const reportPost = useCallback(async (postId: string, reason: string): Promise<void> => {
    try {
      await api.reportPost(postId, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reportar publicación');
      throw err;
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchFeed(1);
  }, [fetchFeed]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    page,
    fetchFeed,
    createPost,
    toggleLike,
    reportPost,
    refresh,
  };
};

