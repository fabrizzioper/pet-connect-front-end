/**
 * usePets Hook
 * Manages pets state and operations
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Pet, CreatePetRequest, UpdatePetRequest } from '@/types/api';

interface UsePetsReturn {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  fetchPets: () => Promise<void>;
  createPet: (data: CreatePetRequest) => Promise<Pet>;
  updatePet: (petId: string, data: UpdatePetRequest) => Promise<Pet>;
  deletePet: (petId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export const usePets = (): UsePetsReturn => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const myPets = await api.getMyPets();
      setPets(myPets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mascotas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPet = useCallback(async (data: CreatePetRequest): Promise<Pet> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.createPet(data);
      if (response.data) {
        setPets((prev) => [...prev, response.data as Pet]);
        return response.data;
      }
      throw new Error('No se recibió la mascota creada');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear mascota';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePet = useCallback(async (petId: string, data: UpdatePetRequest): Promise<Pet> => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updatePet(petId, data);
      setPets((prev) => prev.map((pet) => (pet._id === petId ? updated : pet)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar mascota';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePet = useCallback(async (petId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deletePet(petId);
      setPets((prev) => prev.filter((pet) => pet._id !== petId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar mascota';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchPets();
  }, [fetchPets]);

  return {
    pets,
    isLoading,
    error,
    fetchPets,
    createPet,
    updatePet,
    deletePet,
    refresh,
  };
};

