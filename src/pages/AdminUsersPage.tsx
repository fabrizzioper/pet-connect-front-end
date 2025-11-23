/**
 * Admin Users Page
 * Manage users (block, unblock, view)
 */

import { useEffect, useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import type { User } from '@/types/api';

export const AdminUsersPage = () => {
  const { users, isLoading, error, fetchUsers } = useUsers();
  const { blockUser, isLoading: isBlocking } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleBlock = async (user: User, blocked: boolean): Promise<void> => {
    setBlockingUserId(user._id);
    try {
      await blockUser(user._id, {
        blocked,
        reason: blocked ? 'Usuario bloqueado por administrador' : 'Usuario desbloqueado',
      });
      await fetchUsers(1);
    } catch (err) {
      // Error ya está manejado en el hook
    } finally {
      setBlockingUserId(null);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestionar Usuarios</h1>
        <Button onClick={() => fetchUsers(1)} variant="outline">
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Buscar por nombre, email o username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user._id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={user.profilePicture} alt={user.username} />
                    <AvatarFallback>
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleBlock(user, true)}
                      disabled={isBlocking && blockingUserId === user._id}
                    >
                      {isBlocking && blockingUserId === user._id ? 'Bloqueando...' : 'Bloquear'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBlock(user, false)}
                      disabled={isBlocking && blockingUserId === user._id}
                    >
                      {isBlocking && blockingUserId === user._id ? 'Desbloqueando...' : 'Desbloquear'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron usuarios</p>
        </div>
      )}
    </div>
  );
};

