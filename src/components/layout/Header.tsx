/**
 * Header Component
 * Main navigation header
 */

import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, PawPrint } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    // Durante hot reload, el contexto puede no estar disponible temporalmente
    // Retornar un header básico sin funcionalidad de auth
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <PawPrint className="h-6 w-6 text-primary" />
            <span className="text-2xl font-bold text-primary">PetConnect</span>
          </Link>
        </div>
      </header>
    );
  }

  const { user, isAuthenticated, logout } = authContext;
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold text-primary">PetConnect</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/feed">
                <Button variant="ghost">Feed</Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost">Mi Perfil</Button>
              </Link>
              <Link to="/pets">
                <Button variant="ghost">Mis Mascotas</Button>
              </Link>
              <Link to="/search">
                <Button variant="ghost" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </Link>
              {user?.role === 'ADMIN' && (
                <Link to="/admin">
                  <Button variant="outline" className="bg-primary/10 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-2">
                <Link to={`/users/${user?._id}`}>
                  <Avatar>
                    <AvatarImage src={user?.profilePicture} alt={user?.username} />
                    <AvatarFallback>
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" onClick={handleLogout}>
                  Salir
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

