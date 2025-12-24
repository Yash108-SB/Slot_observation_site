'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface Faculty {
  id: string;
  name: string;
  department: string;
}

interface FacultyContextType {
  faculties: Faculty[];
  addFaculty: (faculty: Omit<Faculty, 'id'>) => Promise<void>;
  updateFaculty: (id: string, faculty: Omit<Faculty, 'id'>) => Promise<void>;
  deleteFaculty: (id: string) => Promise<void>;
  refreshFaculties: () => Promise<void>;
  isLoading: boolean;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export function FacultyProvider({ children }: { children: ReactNode }) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch faculties from backend
  const refreshFaculties = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/slots/faculties');
      console.log('FacultyContext - Loaded from backend:', response.data);
      setFaculties(response.data);
    } catch (error) {
      console.error('Error loading faculties from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load faculties on mount
  useEffect(() => {
    refreshFaculties();
  }, []);

  const addFaculty = async (facultyData: Omit<Faculty, 'id'>) => {
    try {
      console.log('FacultyContext - Adding faculty:', facultyData);
      const response = await api.post('/slots/faculties', facultyData);
      setFaculties(prev => [...prev, response.data]);
      console.log('FacultyContext - Faculty added:', response.data);
    } catch (error) {
      console.error('Error adding faculty:', error);
      throw error;
    }
  };

  const updateFaculty = async (id: string, updatedData: Omit<Faculty, 'id'>) => {
    try {
      console.log('FacultyContext - Updating faculty:', id, updatedData);
      const response = await api.patch(`/slots/faculties/${id}`, updatedData);
      setFaculties(prev => prev.map(f => 
        f.id === id ? response.data : f
      ));
      console.log('FacultyContext - Faculty updated:', response.data);
    } catch (error) {
      console.error('Error updating faculty:', error);
      throw error;
    }
  };

  const deleteFaculty = async (id: string) => {
    try {
      console.log('FacultyContext - Deleting faculty:', id);
      await api.delete(`/slots/faculties/${id}`);
      setFaculties(prev => prev.filter(f => f.id !== id));
      console.log('FacultyContext - Faculty deleted:', id);
    } catch (error) {
      console.error('Error deleting faculty:', error);
      throw error;
    }
  };

  return (
    <FacultyContext.Provider value={{ faculties, addFaculty, updateFaculty, deleteFaculty, refreshFaculties, isLoading }}>
      {children}
    </FacultyContext.Provider>
  );
}

export function useFaculty() {
  const context = useContext(FacultyContext);
  if (context === undefined) {
    throw new Error('useFaculty must be used within a FacultyProvider');
  }
  return context;
}
