/**
 * Create Post Form Component
 * Form to create a new post
 */

import { useState, useEffect, useRef } from 'react';
import { Image, X } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { usePets } from '@/hooks/usePets';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CreatePostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreatePostForm = ({ onSuccess, onCancel }: CreatePostFormProps) => {
  const { createPost, isLoading } = usePosts();
  const { pets, fetchPets } = usePets();
  const [content, setContent] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [category, setCategory] = useState('dog');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result && images.length < 5) {
            setImages((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number): void => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    try {
      await createPost({
        content: content.trim(),
        petId: selectedPetId || undefined,
        category,
        media: images.map((url) => ({
          type: 'image' as const,
          url,
        })),
      });
      setContent('');
      setSelectedPetId('');
      setImages([]);
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
        <CardTitle>Crear Publicación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="¿Qué quieres compartir?"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="images">Imágenes (máximo 5)</Label>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 5}
                className="w-full"
              >
                <Image className="h-4 w-4 mr-2" />
                {images.length >= 5 ? 'Máximo 5 imágenes' : `Agregar imágenes (${images.length}/5)`}
              </Button>
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pets.length > 0 && (
            <div>
              <Label htmlFor="pet">Mascota (opcional)</Label>
              <select
                id="pet"
                value={selectedPetId}
                onChange={(e) => setSelectedPetId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Ninguna</option>
                {pets.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="category">Categoría</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="dog">🐕 Perros</option>
              <option value="cat">🐱 Gatos</option>
              <option value="bird">🐦 Aves</option>
              <option value="exotic">🦎 Exóticos</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || (!content.trim() && images.length === 0)}>
              {isLoading ? 'Publicando...' : 'Publicar'}
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

