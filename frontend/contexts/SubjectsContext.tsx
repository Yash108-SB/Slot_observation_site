'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface Allocation {
  id: string;
  type: 'LAB' | 'LECTURE';
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  batchName?: string;
  labNumbers?: string[];
  classRoomNumbers?: string[];
}

export interface Lab {
  id: string;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  batchName: string;
  labNumbers: string[];
}

export interface Lecture {
  id: string;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  classRoomNumbers: string[];
}

export interface Subject {
  id: string;
  name: string;
  year: string;
}

interface SubjectsContextType {
  labs: Lab[];
  lectures: Lecture[];
  subjects: Subject[];
  addLab: (lab: Omit<Lab, 'id'>) => Promise<void>;
  addLecture: (lecture: Omit<Lecture, 'id'>) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteLab: (id: string) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  refreshSubjects: () => Promise<void>;
  refreshAllocations: () => Promise<void>;
  isLoading: boolean;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subjects from backend
  const refreshSubjects = async () => {
    try {
      const response = await api.get('/slots/subjects');
      console.log('SubjectsContext - Loaded subjects from backend:', response.data);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error loading subjects from backend:', error);
    }
  };

  // Fetch allocations from backend
  const refreshAllocations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/slots/allocations');
      console.log('SubjectsContext - Loaded allocations from backend:', response.data);
      
      // Split allocations into labs and lectures
      const allAllocations: Allocation[] = response.data;
      const labsData = allAllocations
        .filter(a => a.type === 'LAB')
        .map(a => ({
          id: a.id,
          subjectName: a.subjectName,
          facultyName: a.facultyName,
          semester: a.semester,
          division: a.division,
          batchName: a.batchName || '',
          labNumbers: a.labNumbers || [],
        }));
      const lecturesData = allAllocations
        .filter(a => a.type === 'LECTURE')
        .map(a => ({
          id: a.id,
          subjectName: a.subjectName,
          facultyName: a.facultyName,
          semester: a.semester,
          division: a.division,
          classRoomNumbers: a.classRoomNumbers || [],
        }));
      
      setLabs(labsData);
      setLectures(lecturesData);
    } catch (error) {
      console.error('Error loading allocations from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([refreshSubjects(), refreshAllocations()]);
    };
    loadData();
  }, []);

  const addLab = async (labData: Omit<Lab, 'id'>) => {
    try {
      const allocationData: Omit<Allocation, 'id'> = {
        type: 'LAB',
        ...labData,
      };
      const response = await api.post('/slots/allocations', allocationData);
      const newLab: Lab = {
        id: response.data.id,
        subjectName: response.data.subjectName,
        facultyName: response.data.facultyName,
        semester: response.data.semester,
        division: response.data.division,
        batchName: response.data.batchName || '',
        labNumbers: response.data.labNumbers || [],
      };
      setLabs(prev => [...prev, newLab]);
    } catch (error) {
      console.error('Error adding lab:', error);
      throw error;
    }
  };

  const addLecture = async (lectureData: Omit<Lecture, 'id'>) => {
    try {
      const allocationData: Omit<Allocation, 'id'> = {
        type: 'LECTURE',
        ...lectureData,
      };
      const response = await api.post('/slots/allocations', allocationData);
      const newLecture: Lecture = {
        id: response.data.id,
        subjectName: response.data.subjectName,
        facultyName: response.data.facultyName,
        semester: response.data.semester,
        division: response.data.division,
        classRoomNumbers: response.data.classRoomNumbers || [],
      };
      setLectures(prev => [...prev, newLecture]);
    } catch (error) {
      console.error('Error adding lecture:', error);
      throw error;
    }
  };

  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    try {
      const response = await api.post('/slots/subjects', subjectData);
      setSubjects(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error adding subject:', error);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await api.delete(`/slots/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      throw error;
    }
  };

  const deleteLab = async (id: string) => {
    try {
      await api.delete(`/slots/allocations/${id}`);
      setLabs(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lab:', error);
      throw error;
    }
  };

  const deleteLecture = async (id: string) => {
    try {
      await api.delete(`/slots/allocations/${id}`);
      setLectures(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('Error deleting lecture:', error);
      throw error;
    }
  };

  return (
    <SubjectsContext.Provider
      value={{
        labs,
        lectures,
        subjects,
        addLab,
        addLecture,
        addSubject,
        deleteSubject,
        deleteLab,
        deleteLecture,
        refreshSubjects,
        refreshAllocations,
        isLoading,
      }}
    >
      {children}
    </SubjectsContext.Provider>
  );
}

export function useSubjects() {
  const context = useContext(SubjectsContext);
  if (context === undefined) {
    throw new Error('useSubjects must be used within a SubjectsProvider');
  }
  return context;
}
