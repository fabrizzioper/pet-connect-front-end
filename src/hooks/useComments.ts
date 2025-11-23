/**
 * useComments Hook
 * Manages comments state and operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from '@/types/api';

interface UseCommentsReturn {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  fetchComments: (postId: string, page?: number) => Promise<void>;
  createComment: (postId: string, data: CreateCommentRequest) => Promise<Comment>;
  updateComment: (commentId: string, data: UpdateCommentRequest) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
  refresh: (postId: string) => Promise<void>;
  page: number;
  hasMore: boolean;
}

export const useComments = (): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(async (postId: string, pageNum = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getComments(postId, pageNum, 10);
      const newComments = response.comments || [];
      if (pageNum === 1) {
        setComments(newComments);
      } else {
        setComments((prev) => [...prev, ...newComments]);
      }
      setPage(pageNum);
      setHasMore(
        response.pagination && pageNum < response.pagination.totalPages
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createComment = useCallback(async (
    postId: string,
    data: CreateCommentRequest
  ): Promise<Comment> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.createComment(postId, data);
      // El backend retorna { message, comment }
      const newComment = response.comment;
      if (newComment) {
        setComments((prev) => [newComment, ...prev]);
        return newComment;
      }
      throw new Error('No se recibió el comentario creado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear comentario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateComment = useCallback(async (
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.updateComment(commentId, data);
      if (response.data) {
        const updated = response.data;
        setComments((prev) =>
          prev.map((comment) => (comment._id === commentId ? updated : comment))
        );
        return updated;
      }
      throw new Error('No se recibió el comentario actualizado');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar comentario';
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
      await api.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar comentario';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (commentId: string): Promise<void> => {
    try {
      await api.toggleCommentLike(commentId);
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            const isLiked = comment.isLiked;
            return {
              ...comment,
              isLiked: !isLiked,
              likesCount: (comment.likesCount || 0) + (isLiked ? -1 : 1),
            };
          }
          return comment;
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al dar like');
    }
  }, []);

  const refresh = useCallback(async (postId: string): Promise<void> => {
    await fetchComments(postId, 1);
  }, [fetchComments]);

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleLike,
    refresh,
    page,
    hasMore,
  };
};

