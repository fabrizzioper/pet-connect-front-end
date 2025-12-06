/**
 * Pets Page
 * User's pets management page
 */

import { useEffect, useState } from 'react';
import { usePets } from '@/hooks/usePets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreatePetForm } from '@/components/pet/CreatePetForm';

export const PetsPage = () => {
  const { pets, isLoading, error, fetchPets } = usePets();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Cargando mascotas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => fetchPets()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mis Mascotas</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancelar' : '+ Agregar Mascota'}
        </Button>
      </div>

      {showCreateForm && (
        <div className="mb-6">
          <CreatePetForm
            onSuccess={() => {
              setShowCreateForm(false);
              fetchPets();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {!Array.isArray(pets) || pets.length === 0 ? (
        !showCreateForm && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No tienes mascotas registradas aún</p>
              <Button onClick={() => setShowCreateForm(true)}>Agregar tu primera mascota</Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {Array.isArray(pets) && pets.map((pet) => (
            <Card key={pet._id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={pet.profilePicture || (pet.photos && pet.photos.length > 0 ? pet.photos[0] : undefined)} 
                      alt={pet.name} 
                    />
                    <AvatarFallback>
                      {pet.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{pet.name}</CardTitle>
                    <CardDescription>
                      {pet.type} {pet.breed && `• ${pet.breed}`}
                      {pet.age && ` • ${pet.age} años`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {pet.description && (
                <CardContent>
                  <p className="text-muted-foreground">{pet.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

