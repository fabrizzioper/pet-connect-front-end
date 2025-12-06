/**
 * Search Page
 * Search for users, posts, and pets
 */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostCard } from '@/components/post/PostCard';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const { users, posts, pets, isLoading, error, search } = useSearch();

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, []); // Only run on mount

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
      search(searchQuery);
    }
  };

  const handleQueryChange = (value: string): void => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Buscar</h1>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Buscar usuarios, publicaciones, mascotas..."
            value={searchQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </form>

      {error && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {query && !isLoading && (
        <>
          {users.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Usuarios ({users.length})</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user._id}>
                    <CardHeader>
                      <Link to={`/users/${user._id}`} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.profilePicture} alt={user.username} />
                          <AvatarFallback>
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{user.fullName || user.username}</CardTitle>
                          <CardDescription>@{user.username}</CardDescription>
                        </div>
                      </Link>
                    </CardHeader>
                    {user.bio && (
                      <CardContent>
                        <p className="text-muted-foreground">{user.bio}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Publicaciones ({posts.length})</h2>
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {pets.length > 0 && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Mascotas ({pets.length})</h2>
              <div className="space-y-4">
                {pets.map((pet) => (
                  <Card key={pet._id}>
                    <CardHeader>
                      <CardTitle>{pet.name}</CardTitle>
                      <CardDescription>
                        {pet.type} {pet.breed && `• ${pet.breed}`}
                        {pet.age && ` • ${pet.age} años`}
                      </CardDescription>
                    </CardHeader>
                    {pet.description && (
                      <CardContent>
                        <p className="text-muted-foreground">{pet.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!isLoading && users.length === 0 && posts.length === 0 && pets.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No se encontraron resultados para "{query}"</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!query && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Ingresa un término de búsqueda para comenzar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

