/**
 * User Profile Page
 * Public user profile page
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/post/PostCard';
import type { User, Post } from '@/types/api';

export const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);
      try {
        const [userData, postsData] = await Promise.all([
          api.getUserById(userId),
          api.getUserPosts(userId, 1, 10),
        ]);
        setUser(userData);
        setPosts(postsData.posts || []);
        setIsFollowing(
          currentUser?.following?.includes(userId) || false
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  const handleFollow = async (): Promise<void> => {
    if (!userId || !user) return;

    try {
      if (isFollowing) {
        await api.unfollowUser(userId);
        setIsFollowing(false);
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followersCount: (prev.followersCount || 0) - 1,
          };
        });
      } else {
        await api.followUser(userId);
        setIsFollowing(true);
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            followersCount: (prev.followersCount || 0) + 1,
          };
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar seguimiento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Usuario no encontrado'}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback className="text-2xl">
                  {user.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.fullName || user.username}</CardTitle>
                <CardDescription>@{user.username}</CardDescription>
              </div>
            </div>
            {!isOwnProfile && currentUser && (
              <Button onClick={handleFollow} variant={isFollowing ? 'outline' : 'default'}>
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">Biografía</h3>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{user.followersCount || user.followers?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.followingCount || user.following?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Siguiendo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{user.postsCount || posts.length}</p>
              <p className="text-sm text-muted-foreground">Publicaciones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Publicaciones</h2>
        {posts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No hay publicaciones aún</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

