/**
 * Create Pet Form Component
 * Form to create a new pet
 */

import { useState, useRef } from 'react';
import { usePets } from '@/hooks/usePets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreatePetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreatePetForm = ({ onSuccess, onCancel }: CreatePetFormProps) => {
  const { createPet, isLoading } = usePets();
  const [name, setName] = useState('');
  const [type, setType] = useState('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setProfilePicture(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (): void => {
    setProfilePicture('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createPet({
        name: name.trim(),
        type,
        breed: breed.trim() || undefined,
        age: age ? Number(age) : undefined,
        description: description.trim() || undefined,
        profilePicture: profilePicture || undefined,
      });
      // Reset form
      setName('');
      setType('dog');
      setBreed('');
      setAge('');
      setDescription('');
      setProfilePicture('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onSuccess?.();
    } catch (err) {
      // Error ya es manejado por el hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Mascota</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de tu mascota"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Tipo *</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="dog">🐕 Perro</option>
              <option value="cat">🐱 Gato</option>
              <option value="bird">🐦 Ave</option>
              <option value="exotic">🦎 Exótico</option>
            </select>
          </div>

          <div>
            <Label htmlFor="breed">Raza (opcional)</Label>
            <Input
              id="breed"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Ej: Golden Retriever"
            />
          </div>

          <div>
            <Label htmlFor="age">Edad (opcional)</Label>
            <Input
              id="age"
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              placeholder="Edad en años"
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos sobre tu mascota..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="profilePicture">Foto de Perfil (opcional)</Label>
            <Input
              id="profilePicture"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="mb-2"
            />
            {profilePicture && (
              <div className="mt-2 relative inline-block">
                <img
                  src={profilePicture}
                  alt="Vista previa"
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={removeImage}
                  className="absolute top-0 right-0 -mt-2 -mr-2"
                >
                  ×
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? 'Guardando...' : 'Agregar Mascota'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};





