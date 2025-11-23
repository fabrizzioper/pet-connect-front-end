/**
 * Feed Page
 * Main feed with posts
 */

import { useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';

export const FeedPage = () => {
  const { posts, isLoading, error, hasMore, fetchFeed, page } = usePosts();

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const loadMore = (): void => {
    if (hasMore && !isLoading) {
      fetchFeed(page + 1);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando publicaciones...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchFeed(1)}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>
      {!posts || posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay publicaciones aún</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          {hasMore && (
            <div className="text-center mt-6">
              <Button onClick={loadMore} disabled={isLoading} variant="outline">
                {isLoading ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

