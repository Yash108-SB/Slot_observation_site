'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Lab {
  id: number;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  batchName: string;
  labNumbers: string[];
}

export interface Lecture {
  id: number;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  classRoomNumbers: string[];
}

export interface Subject {
  id: number;
  name: string;
  year: string;
}

interface SubjectsContextType {
  labs: Lab[];
  lectures: Lecture[];
  subjects: Subject[];
  setLabs: (labs: Lab[]) => void;
  setLectures: (lectures: Lecture[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  addLab: (lab: Lab) => void;
  addLecture: (lecture: Lecture) => void;
  addSubject: (subject: Subject) => void;
}

const SubjectsContext = createContext<SubjectsContextType | undefined>(undefined);

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedLabs = localStorage.getItem('labs');
      const savedLectures = localStorage.getItem('lectures');
      const savedSubjects = localStorage.getItem('subjects');
      
      console.log('SubjectsContext - Loading from localStorage');
      console.log('Saved labs:', savedLabs);
      console.log('Saved lectures:', savedLectures);
      console.log('Saved subjects:', savedSubjects);
      
      if (savedLabs) {
        const parsedLabs = JSON.parse(savedLabs);
        console.log('Parsed labs:', parsedLabs);
        setLabs(parsedLabs);
      }
      if (savedLectures) {
        const parsedLectures = JSON.parse(savedLectures);
        console.log('Parsed lectures:', parsedLectures);
        setLectures(parsedLectures);
      }
      if (savedSubjects) {
        const parsedSubjects = JSON.parse(savedSubjects);
        console.log('Parsed subjects:', parsedSubjects);
        setSubjects(parsedSubjects);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever data changes (only after initial load)
  useEffect(() => {
    if (isLoaded) {
      console.log('SubjectsContext - Saving labs to localStorage:', labs);
      localStorage.setItem('labs', JSON.stringify(labs));
    }
  }, [labs, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      console.log('SubjectsContext - Saving lectures to localStorage:', lectures);
      localStorage.setItem('lectures', JSON.stringify(lectures));
    }
  }, [lectures, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      console.log('SubjectsContext - Saving subjects to localStorage:', subjects);
      localStorage.setItem('subjects', JSON.stringify(subjects));
    }
  }, [subjects, isLoaded]);

  const addLab = (lab: Lab) => {
    setLabs([...labs, lab]);
  };

  const addLecture = (lecture: Lecture) => {
    setLectures([...lectures, lecture]);
  };

  const addSubject = (subject: Subject) => {
    setSubjects([...subjects, subject]);
  };

  return (
    <SubjectsContext.Provider
      value={{
        labs,
        lectures,
        subjects,
        setLabs,
        setLectures,
        setSubjects,
        addLab,
        addLecture,
        addSubject,
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
