/**
 * Comments Section Component
 * Displays and manages comments for a post
 */

import { useState, useEffect } from 'react';
import { MessageCircle, Heart } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post } from '@/types/api';

interface CommentsSectionProps {
  post: Post;
  onCommentAdded?: () => void;
}

export const CommentsSection = ({ post, onCommentAdded }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { comments, isLoading, error, fetchComments, createComment, toggleLike, page, hasMore } = useComments();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments(post._id, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments, post._id]);

  const handleToggleComments = (): void => {
    if (!showComments) {
      fetchComments(post._id, 1);
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await createComment(post._id, { content: newComment.trim() });
      setNewComment('');
      // Recargar comentarios para obtener el comentario completo con todos los datos
      await fetchComments(post._id, 1);
      // Notificar al componente padre que se agregó un comentario
      onCommentAdded?.();
    } catch (err) {
      // Error manejado por el hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = (): void => {
    if (hasMore && !isLoading) {
      fetchComments(post._id, page + 1);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleComments}
        className="h-8 text-muted-foreground flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>{post.commentsCount || 0}</span>
        <span>{showComments ? 'Ocultar' : 'Ver'} comentarios</span>
      </Button>

      {showComments && (
        <div className="space-y-4">
          {user && (
            <Card>
              <CardContent className="pt-4">
                <form onSubmit={handleSubmitComment} className="space-y-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    rows={2}
                  />
                  <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? 'Comentando...' : 'Comentar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {isLoading && comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay comentarios aún</p>
          ) : (
            <>
              {comments.map((comment) => {
                const author = typeof comment.author === 'object' ? comment.author : null;
                return (
                  <Card key={comment._id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={author?.profilePicture} alt={author?.username} />
                          <AvatarFallback>
                            {author?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold">{author?.fullName || author?.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-6 px-2 flex items-center gap-1 ${
                                comment.isLiked ? 'text-red-500' : 'text-muted-foreground'
                              }`}
                              onClick={() => toggleLike(comment._id)}
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  comment.isLiked
                                    ? 'fill-red-500 text-red-500'
                                    : 'fill-none text-muted-foreground'
                                }`}
                              />
                              <span>{comment.likesCount || 0}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {hasMore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Cargando...' : 'Cargar más comentarios'}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

