/**
 * Post Card Component
 * Displays a single post
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, PawPrint } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CommentsSection } from './CommentsSection';
import type { Post } from '@/types/api';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const { toggleLike } = usePosts();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  
  // Estado local para el like - se actualiza inmediatamente
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);

  // Sincronizar con el post cuando cambie, pero solo si el post tiene valores válidos
  useEffect(() => {
    // Solo actualizar si el post tiene valores definidos y son diferentes
    if (post.isLiked !== undefined && post.likesCount !== undefined) {
      setIsLiked(post.isLiked);
      setLikesCount(post.likesCount);
    }
  }, [post.isLiked, post.likesCount, post._id]);

  const author = typeof post.author === 'object' ? post.author : null;
  const pet = typeof post.pet === 'object' ? post.pet : null;

  const handleLike = async (): Promise<void> => {
    console.log('🔴 handleLike llamado - Post ID:', post._id);
    console.log('🔴 Estado actual - isLiked:', isLiked, 'likesCount:', likesCount);
    console.log('🔴 Usuario autenticado:', isAuthenticated, 'user:', user);
    
    if (!isAuthenticated || !user) {
      console.log('🔴 Usuario no autenticado, redirigiendo a login');
      navigate('/login');
      return;
    }
    
    setIsLiking(true);
    
    // Actualización optimista inmediata
    const newIsLiked = !isLiked;
    console.log('🔴 Nuevo estado - newIsLiked:', newIsLiked);
    setIsLiked(newIsLiked);
    setLikesCount(newIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1));
    
    try {
      console.log('🔴 Llamando a toggleLike con postId:', post._id);
      // El hook toggleLike actualiza el estado y luego recarga el feed
      await toggleLike(post._id);
      console.log('🔴 toggleLike completado exitosamente');
      // El useEffect sincronizará el estado local con el post actualizado
    } catch (error) {
      console.error('🔴 Error en toggleLike:', error);
      // Revertir en caso de error
      setIsLiked(!newIsLiked);
      setLikesCount(newIsLiked ? likesCount - 1 : likesCount + 1);
    } finally {
      setIsLiking(false);
      console.log('🔴 handleLike finalizado');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 pb-3">
        <Link to={author?._id ? `/users/${author._id}` : '#'}>
          <Avatar>
            <AvatarImage src={author?.profilePicture} alt={author?.username} />
            <AvatarFallback>{author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link to={author?._id ? `/users/${author._id}` : '#'}>
            <p className="font-semibold hover:underline">{author?.fullName || author?.username}</p>
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pet && (
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">{pet.name}</p>
            </div>
            {pet.type && <p className="text-xs text-muted-foreground ml-6">{pet.type}</p>}
          </div>
        )}
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media && post.media.length > 0 && (
          <div className="space-y-2">
            {post.media.map((item, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={`Media ${index + 1}`} 
                    className="w-full h-auto rounded-lg object-cover max-h-96"
                    onError={(e) => {
                      // Si la imagen falla, ocultar el elemento
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <video src={item.url} controls className="w-full rounded-lg" />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={`h-8 transition-all duration-200 flex items-center gap-2 ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Heart 
              className={`h-5 w-5 transition-all ${
                isLiked 
                  ? 'fill-red-500 text-red-500' 
                  : 'fill-none text-muted-foreground'
              }`}
            />
            <span className={isLiked ? 'text-red-500 font-semibold' : 'text-muted-foreground'}>
              {likesCount}
            </span>
          </Button>
          <CommentsSection post={post} />
        </div>
      </CardContent>
    </Card>
  );
};

