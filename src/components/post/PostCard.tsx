/**
 * Post Card Component
 * Displays a single post
 */

import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post } from '@/types/api';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const { toggleLike } = usePosts();
  const [isLiking, setIsLiking] = useState(false);

  const author = typeof post.author === 'object' ? post.author : null;
  const pet = typeof post.pet === 'object' ? post.pet : null;

  const handleLike = async (): Promise<void> => {
    setIsLiking(true);
    try {
      await toggleLike(post._id);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 pb-3">
        <Avatar>
          <AvatarImage src={author?.profilePicture} alt={author?.username} />
          <AvatarFallback>{author?.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{author?.fullName || author?.username}</p>
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
            <p className="text-sm font-medium">🐾 {pet.name}</p>
            {pet.type && <p className="text-xs text-muted-foreground">{pet.type}</p>}
          </div>
        )}
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.media && post.media.length > 0 && (
          <div className="space-y-2">
            {post.media.map((item, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-auto" />
                ) : (
                  <video src={item.url} controls className="w-full" />
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-4 pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className={post.isLiked ? 'text-primary' : ''}
          >
            ❤️ {post.likesCount || 0}
          </Button>
          <Button variant="ghost" size="sm">
            💬 {post.commentsCount || 0}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

