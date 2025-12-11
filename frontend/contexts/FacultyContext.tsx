'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Faculty {
  id: number;
  name: string;
  department: string;
}

interface FacultyContextType {
  faculties: Faculty[];
  addFaculty: (faculty: Faculty) => void;
  updateFaculty: (id: number, faculty: Omit<Faculty, 'id'>) => void;
  deleteFaculty: (id: number) => void;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export function FacultyProvider({ children }: { children: ReactNode }) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load faculties from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('faculties');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('FacultyContext - Loaded from localStorage:', parsed);
        setFaculties(parsed);
      } catch (error) {
        console.error('Error loading faculties from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save faculties to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      console.log('FacultyContext - Saving to localStorage:', faculties);
      localStorage.setItem('faculties', JSON.stringify(faculties));
    }
  }, [faculties, isInitialized]);

  const addFaculty = (faculty: Faculty) => {
    console.log('FacultyContext - Adding faculty:', faculty);
    setFaculties(prev => {
      const updated = [...prev, faculty];
      console.log('FacultyContext - Updated faculties:', updated);
      return updated;
    });
  };

  const updateFaculty = (id: number, updatedData: Omit<Faculty, 'id'>) => {
    console.log('FacultyContext - Updating faculty:', id, updatedData);
    setFaculties(prev => prev.map(f => 
      f.id === id ? { ...f, ...updatedData } : f
    ));
  };

  const deleteFaculty = (id: number) => {
    console.log('FacultyContext - Deleting faculty:', id);
    setFaculties(prev => prev.filter(f => f.id !== id));
  };

  return (
    <FacultyContext.Provider value={{ faculties, addFaculty, updateFaculty, deleteFaculty }}>
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
