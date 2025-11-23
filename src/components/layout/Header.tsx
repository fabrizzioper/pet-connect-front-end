/**
 * Header Component
 * Main navigation header
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">🐾 PetConnect</span>
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

