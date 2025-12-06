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
      // El backend ahora incluye currentUserId en la respuesta
      // Esto ayuda a identificar qué posts tienen like del usuario actual
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
      // El backend retorna { message, post }
      const newPost = response.post;
      if (newPost) {
        // Asegurar que el post tenga los campos necesarios
        const postWithDefaults = {
          ...newPost,
          isLiked: false,
          likesCount: 0,
          commentsCount: 0,
        };
        setPosts((prev) => [postWithDefaults, ...prev]);
        return postWithDefaults;
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
    console.log('🟢 toggleLike llamado - postId:', postId);
    console.log('🟢 Posts actuales:', posts.length, 'posts');
    
    try {
      // Optimistic update: actualizar inmediatamente la UI si el post existe
      setPosts((prev) => {
        const currentPost = prev.find(p => p._id === postId);
        if (currentPost) {
          console.log('🟢 Post encontrado, actualizando optimísticamente');
          const currentIsLiked = currentPost.isLiked ?? false;
          const currentLikesCount = currentPost.likesCount ?? 0;
          const newIsLiked = !currentIsLiked;
          const newLikesCount = newIsLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1);
          
          return prev.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                isLiked: newIsLiked,
                likesCount: newLikesCount,
              };
            }
            return post;
          });
        } else {
          console.log('🟢 Post no encontrado en el array, continuando con la petición');
        }
        return prev;
      });

      // SIEMPRE hacer la petición PUT al servidor, incluso si el post no está en el array
      console.log('🟢 Llamando a api.toggleLike con postId:', postId);
      const response = await api.toggleLike(postId);
      console.log('🟢 Respuesta del servidor:', response);
      
      // Después de dar like, SIEMPRE recargar el feed completo para obtener todos los posts
      // con el identificador isLiked actualizado desde el backend
      console.log('🟢 Recargando feed con page:', page);
      await fetchFeed(page);
      console.log('🟢 Feed recargado exitosamente');
    } catch (err) {
      console.error('🟢 ERROR en toggleLike:', err);
      // Revertir el cambio optimista en caso de error
      setPosts((prev) => {
        const currentPost = prev.find(p => p._id === postId);
        if (currentPost) {
          const currentIsLiked = currentPost.isLiked ?? false;
          const currentLikesCount = currentPost.likesCount ?? 0;
          console.log('🟢 Revirtiendo cambio optimista');
          return prev.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                isLiked: !currentIsLiked,
                likesCount: currentIsLiked ? currentLikesCount - 1 : currentLikesCount + 1,
              };
            }
            return post;
          });
        }
        return prev;
      });
      setError(err instanceof Error ? err.message : 'Error al dar like');
      throw err;
    }
  }, [page, fetchFeed]);

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

