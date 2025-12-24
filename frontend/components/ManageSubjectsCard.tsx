'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Pencil, Trash2, FlaskConical, School, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useFaculty } from '@/contexts/FacultyContext';
import { useSubjects } from '@/contexts/SubjectsContext';

interface Lab {
  id: string;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  batchName: string;
  labNumbers: string[];
}

interface Lecture {
  id: string;
  subjectName: string;
  facultyName: string;
  semester: string;
  division: string;
  classRoomNumbers: string[];
}

interface Subject {
  id: string;
  name: string;
  year: string;
}

interface ManageSubjectsCardProps {
  onBack?: () => void;
}

type Year = '1st' | '2nd' | '3rd' | '4th';
type View = 'hub' | 'year-detail';
type EntryType = 'lab' | 'lecture';

const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const divisions = ['DIV-I', 'DIV-II'];
const batchesDivI = ['A1', 'B1', 'C1'];
const batchesDivII = ['A2', 'B2', 'C2'];
const labNumbers = ['631', '632', '633', '634', '638', '515'];
const classRoomNumbers = ['505', '506', '507', '508'];

// Get semesters based on year
const getSemestersForYear = (year: Year | null): string[] => {
  if (!year) return semesters;
  switch (year) {
    case '1st':
      return ['Semester 1', 'Semester 2'];
    case '2nd':
      return ['Semester 3', 'Semester 4'];
    case '3rd':
      return ['Semester 5', 'Semester 6'];
    case '4th':
      return ['Semester 7', 'Semester 8'];
    default:
      return semesters;
  }
};

export default function ManageSubjectsCard({ onBack }: ManageSubjectsCardProps) {
  const { faculties } = useFaculty();
  const { labs: allLabs, lectures: allLectures, subjects: allSubjects, addLab, addLecture, addSubject, deleteSubject, deleteLab, deleteLecture, isLoading } = useSubjects();
  const [currentView, setCurrentView] = useState<View>('hub');
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  
  // Filter data by selected year
  const labs = allLabs.filter(lab => {
    const subject = allSubjects.find(s => s.name === lab.subjectName && s.year === selectedYear);
    return !!subject;
  });
  
  const lectures = allLectures.filter(lecture => {
    const subject = allSubjects.find(s => s.name === lecture.subjectName && s.year === selectedYear);
    return !!subject;
  });
  
  const subjects = allSubjects.filter(s => s.year === selectedYear);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>('lab');

  // Debug: Log faculties when component renders or faculties change
  useEffect(() => {
    console.log('ManageSubjectsCard - Current faculties:', faculties);
  }, [faculties]);
  
  // Debug: Log all subjects from context
  useEffect(() => {
    console.log('ManageSubjectsCard - All subjects from context:', allSubjects);
  }, [allSubjects]);
  
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [subjectFormData, setSubjectFormData] = useState({ name: '' });
  
  const [labFormData, setLabFormData] = useState({ 
    subjectName: '',
    facultyName: '', 
    semester: '',
    division: '',
    batchName: '', 
    labNumbers: [] as string[] 
  });
  
  const [lectureFormData, setLectureFormData] = useState({ 
    subjectName: '',
    facultyName: '', 
    semester: '', 
    division: '',
    classRoomNumbers: [] as string[] 
  });
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const { toast } = useToast();

  const handleYearClick = (year: Year) => {
    setSelectedYear(year);
    setCurrentView('year-detail');
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    setSelectedYear(null);
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    setSubjectFormData({ name: '' });
    setSubjectDialogOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setSubjectFormData({ name: subject.name });
    setSubjectDialogOpen(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectFormData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a subject name',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingSubject) {
        // Update functionality not yet implemented in context
        toast({
          title: 'Error',
          description: 'Subject editing not yet supported',
          variant: 'destructive',
        });
      } else {
        const newSubjectData = {
          name: subjectFormData.name,
          year: selectedYear!,
        };
        console.log('ManageSubjectsCard - Adding new subject:', newSubjectData);
        await addSubject(newSubjectData);
        toast({
          title: 'Success',
          description: 'Subject added successfully',
        });
      }
      setSubjectDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save subject',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    }
  };

  const handleAddLab = () => {
    setEntryType('lab');
    setEditingLab(null);
    setLabFormData({ subjectName: '', facultyName: '', semester: '', division: '', batchName: '', labNumbers: [] });
    setDialogOpen(true);
  };

  const handleAddLecture = () => {
    setEntryType('lecture');
    setEditingLecture(null);
    setLectureFormData({ subjectName: '', facultyName: '', semester: '', division: '', classRoomNumbers: [] });
    setDialogOpen(true);
  };

  const handleEditLab = (lab: Lab) => {
    setEntryType('lab');
    setEditingLab(lab);
    setLabFormData({ 
      subjectName: lab.subjectName,
      facultyName: lab.facultyName, 
      semester: lab.semester, 
      division: lab.division,
      batchName: lab.batchName, 
      labNumbers: lab.labNumbers 
    });
    setDialogOpen(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setEntryType('lecture');
    setEditingLecture(lecture);
    setLectureFormData({ 
      subjectName: lecture.subjectName,
      facultyName: lecture.facultyName, 
      semester: lecture.semester, 
      division: lecture.division,
      classRoomNumbers: lecture.classRoomNumbers 
    });
    setDialogOpen(true);
  };

  const handleSaveLab = async () => {
    if (!labFormData.subjectName || !labFormData.facultyName.trim() || !labFormData.semester || !labFormData.division || !labFormData.batchName || labFormData.labNumbers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingLab) {
        // Update functionality not yet implemented
        toast({
          title: 'Error',
          description: 'Lab editing not yet supported',
          variant: 'destructive',
        });
      } else {
        await addLab(labFormData);
        toast({
          title: 'Success',
          description: 'Lab added successfully',
        });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lab',
        variant: 'destructive',
      });
    }
  };

  const handleSaveLecture = async () => {
    if (!lectureFormData.subjectName || !lectureFormData.facultyName.trim() || !lectureFormData.semester || !lectureFormData.division || lectureFormData.classRoomNumbers.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingLecture) {
        // Update functionality not yet implemented
        toast({
          title: 'Error',
          description: 'Lecture editing not yet supported',
          variant: 'destructive',
        });
      } else {
        await addLecture(lectureFormData);
        toast({
          title: 'Success',
          description: 'Lecture added successfully',
        });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lecture',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLab = async (id: string) => {
    try {
      await deleteLab(id);
      toast({
        title: 'Success',
        description: 'Lab deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lab',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLecture = async (id: string) => {
    try {
      await deleteLecture(id);
      toast({
        title: 'Success',
        description: 'Lecture deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lecture',
        variant: 'destructive',
      });
    }
  };

  const toggleLabNumber = (labNumber: string) => {
    setLabFormData(prev => ({
      ...prev,
      labNumbers: prev.labNumbers.includes(labNumber)
        ? prev.labNumbers.filter(n => n !== labNumber)
        : [...prev.labNumbers, labNumber]
    }));
  };

  const toggleClassRoomNumber = (roomNumber: string) => {
    setLectureFormData(prev => ({
      ...prev,
      classRoomNumbers: prev.classRoomNumbers.includes(roomNumber)
        ? prev.classRoomNumbers.filter(n => n !== roomNumber)
        : [...prev.classRoomNumbers, roomNumber]
    }));
  };

  const handleResetYearData = async () => {
    if (!selectedYear) return;
    
    setIsDeleting(true);
    
    try {
      // Get all subjects, labs, and lectures for the selected year
      const subjectsToDelete = subjects;
      const labsToDelete = labs;
      const lecturesToDelete = lectures;
      
      // Delete all allocations (labs and lectures) for this year
      const deletePromises = [
        ...labsToDelete.map(lab => deleteLab(lab.id)),
        ...lecturesToDelete.map(lecture => deleteLecture(lecture.id)),
        ...subjectsToDelete.map(subject => deleteSubject(subject.id)),
      ];
      
      await Promise.all(deletePromises);
      
      toast({
        title: 'Success',
        description: `All data for ${selectedYear} Year has been reset`,
      });
      
      setShowResetConfirm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset year data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Year Detail View
  if (currentView === 'year-detail' && selectedYear) {
    return (
      <div className="space-y-6 animate-in fade-in duration-1000">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Home</span>
          <span>→</span>
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Management</span>
          <span>→</span>
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={handleBackToHub}>Subjects</span>
          <span>→</span>
          <span className="font-semibold text-[#16A34A]">{selectedYear} Year</span>
        </div>

        <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] rounded-t-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="hover:bg-green-100 rounded-xl" onClick={handleBackToHub}>
                  <ArrowLeft className="h-5 w-5 text-[#16A34A]" />
                </Button>
                <div>
                  <CardTitle className="text-3xl font-semibold text-[#1E293B]">{selectedYear} Year Subjects</CardTitle>
                  <CardDescription className="text-base text-[#64748B] mt-1">Manage labs and lectures</CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowResetConfirm(true)}
                className="bg-red-500 hover:bg-red-600 text-white rounded-xl gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Reset Year Data
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Subjects Section */}
            <div className="space-y-4 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <BookOpen className="h-5 w-5 text-[#9333EA]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#1E293B]">Subjects</h3>
                </div>
                <Button className="bg-[#9333EA] hover:bg-[#7E22CE] shadow-sm rounded-xl" onClick={handleAddSubject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>

              {subjects.length === 0 ? (
                <div className="bg-[#F6F8FC] rounded-2xl p-8 text-center border border-[#E2E8F0]">
                  <p className="text-[#64748B]">No subjects added yet. Click "Add Subject" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {subjects.map((subject) => (
                    <Card key={subject.id} className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-[#E2E8F0] bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="bg-purple-50 p-2 rounded-xl flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-[#9333EA]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-[#1E293B] truncate">{subject.name}</h3>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-[#E2E8F0]">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 hover:bg-[#F6F8FC] rounded-lg"
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Pencil className="h-4 w-4 text-[#2563EB]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 hover:bg-red-50 rounded-lg"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="h-4 w-4 text-[#DC2626]" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Labs Section */}
            <div className="space-y-4 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <FlaskConical className="h-5 w-5 text-[#2563EB]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#1E293B]">Labs</h3>
                </div>
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm rounded-xl" onClick={handleAddLab}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lab
                </Button>
              </div>

              {labs.length === 0 ? (
                <div className="bg-[#F6F8FC] rounded-2xl p-8 text-center border border-[#E2E8F0]">
                  <p className="text-[#64748B]">No labs added yet. Click "Add Lab" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {labs.map((lab) => (
                    <Card key={lab.id} className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-[#E2E8F0] bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                            <FlaskConical className="h-6 w-6 text-[#2563EB]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-[#1E293B] mb-1 truncate">{lab.subjectName}</h3>
                            <p className="text-sm text-[#64748B] truncate">{lab.facultyName}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-[#64748B]">{lab.semester}</p>
                          <p className="text-sm text-[#64748B]">Division: {lab.division}</p>
                          <p className="text-sm text-[#64748B]">Batch: {lab.batchName}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {lab.labNumbers.map(num => (
                            <span key={num} className="px-2 py-1 bg-blue-50 text-[#2563EB] text-xs rounded-lg font-medium">
                              Lab {num}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-[#F6F8FC]"
                            onClick={() => handleEditLab(lab)}
                          >
                            <Pencil className="h-4 w-4 mr-1 text-[#2563EB]" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-red-50"
                            onClick={() => handleDeleteLab(lab.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1 text-[#DC2626]" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Lectures Section */}
            <div className="space-y-4 animate-in fade-in duration-1000">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-3 rounded-xl">
                    <School className="h-5 w-5 text-[#16A34A]" />
                  </div>
                  <h3 className="font-semibold text-xl text-[#1E293B]">Lectures</h3>
                </div>
                <Button className="bg-[#16A34A] hover:bg-[#15803D] shadow-sm rounded-xl" onClick={handleAddLecture}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lecture
                </Button>
              </div>

              {lectures.length === 0 ? (
                <div className="bg-[#F6F8FC] rounded-2xl p-8 text-center border border-[#E2E8F0]">
                  <p className="text-[#64748B]">No lectures added yet. Click "Add Lecture" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {lectures.map((lecture) => (
                    <Card key={lecture.id} className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-[#E2E8F0] bg-white">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-green-50 p-3 rounded-xl flex-shrink-0">
                            <School className="h-6 w-6 text-[#16A34A]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-[#1E293B] mb-1 truncate">{lecture.subjectName}</h3>
                            <p className="text-sm text-[#64748B] truncate">{lecture.facultyName}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-[#64748B]">{lecture.semester}</p>
                          <p className="text-sm text-[#64748B]">Division: {lecture.division}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {lecture.classRoomNumbers.map(num => (
                            <span key={num} className="px-2 py-1 bg-green-50 text-[#16A34A] text-xs rounded-lg font-medium">
                              Room {num}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-[#F6F8FC]"
                            onClick={() => handleEditLecture(lecture)}
                          >
                            <Pencil className="h-4 w-4 mr-1 text-[#2563EB]" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-red-50"
                            onClick={() => handleDeleteLecture(lecture.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1 text-[#DC2626]" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {entryType === 'lab' 
                  ? (editingLab ? 'Edit Lab' : 'Add New Lab')
                  : (editingLecture ? 'Edit Lecture' : 'Add New Lecture')
                }
              </DialogTitle>
              <DialogDescription>
                {entryType === 'lab' 
                  ? 'Enter the lab details'
                  : 'Enter the lecture details'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {entryType === 'lab' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subjectName">Subject</Label>
                    <Select
                      value={labFormData.subjectName}
                      onValueChange={(value) => setLabFormData({ ...labFormData, subjectName: value })}
                    >
                      <SelectTrigger id="subjectName">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length === 0 ? (
                          <SelectItem value="no-subject" disabled>
                            No subjects added yet
                          </SelectItem>
                        ) : (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facultyName">Faculty Name</Label>
                    <Select
                      value={labFormData.facultyName}
                      onValueChange={(value) => setLabFormData({ ...labFormData, facultyName: value })}
                    >
                      <SelectTrigger id="facultyName">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.length === 0 ? (
                          <SelectItem value="no-faculty" disabled>
                            No faculties added yet
                          </SelectItem>
                        ) : (
                          faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.name}>
                              {faculty.name} - {faculty.department}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={labFormData.semester}
                      onValueChange={(value) => setLabFormData({ ...labFormData, semester: value })}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSemestersForYear(selectedYear).map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Select
                      value={labFormData.division}
                      onValueChange={(value) => {
                        setLabFormData({ ...labFormData, division: value, batchName: '' });
                      }}
                    >
                      <SelectTrigger id="division">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batchName">Batch Name</Label>
                    <Select
                      value={labFormData.batchName}
                      onValueChange={(value) => setLabFormData({ ...labFormData, batchName: value })}
                      disabled={!labFormData.division}
                    >
                      <SelectTrigger id="batchName">
                        <SelectValue placeholder={labFormData.division ? "Select batch" : "Select division first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {(labFormData.division === 'DIV-I' ? batchesDivI : batchesDivII).map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lab Numbers</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {labNumbers.map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant={labFormData.labNumbers.includes(num) ? "default" : "outline"}
                          className="w-full"
                          onClick={() => toggleLabNumber(num)}
                        >
                          Lab {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subjectNameLec">Subject</Label>
                    <Select
                      value={lectureFormData.subjectName}
                      onValueChange={(value) => setLectureFormData({ ...lectureFormData, subjectName: value })}
                    >
                      <SelectTrigger id="subjectNameLec">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.length === 0 ? (
                          <SelectItem value="no-subject" disabled>
                            No subjects added yet
                          </SelectItem>
                        ) : (
                          subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.name}>
                              {subject.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="facultyNameLec">Faculty Name</Label>
                    <Select
                      value={lectureFormData.facultyName}
                      onValueChange={(value) => setLectureFormData({ ...lectureFormData, facultyName: value })}
                    >
                      <SelectTrigger id="facultyNameLec">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.length === 0 ? (
                          <SelectItem value="no-faculty" disabled>
                            No faculties added yet
                          </SelectItem>
                        ) : (
                          faculties.map((faculty) => (
                            <SelectItem key={faculty.id} value={faculty.name}>
                              {faculty.name} - {faculty.department}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semesterLec">Semester</Label>
                    <Select
                      value={lectureFormData.semester}
                      onValueChange={(value) => setLectureFormData({ ...lectureFormData, semester: value })}
                    >
                      <SelectTrigger id="semesterLec">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSemestersForYear(selectedYear).map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="division">Division</Label>
                    <Select
                      value={lectureFormData.division}
                      onValueChange={(value) => {
                        setLectureFormData({ ...lectureFormData, division: value });
                      }}
                    >
                      <SelectTrigger id="division">
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisions.map((div) => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Classroom Numbers</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {classRoomNumbers.map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant={lectureFormData.classRoomNumbers.includes(num) ? "default" : "outline"}
                          className="w-full"
                          onClick={() => toggleClassRoomNumber(num)}
                        >
                          Room {num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={entryType === 'lab' ? handleSaveLab : handleSaveLecture} 
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D] shadow-sm rounded-xl"
              >
                {(entryType === 'lab' ? editingLab : editingLecture) ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" className="border-[#E2E8F0] hover:bg-[#F6F8FC] rounded-xl" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Subject Dialog */}
        <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </DialogTitle>
              <DialogDescription>
                {editingSubject 
                  ? 'Update the subject name'
                  : 'Enter the subject name'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subjectNameInput">Subject Name</Label>
                <Input
                  id="subjectNameInput"
                  value={subjectFormData.name}
                  onChange={(e) => setSubjectFormData({ name: e.target.value })}
                  placeholder="e.g., Data Structures, Database Management"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveSubject} 
                className="flex-1 bg-[#9333EA] hover:bg-[#7E22CE] shadow-sm rounded-xl"
              >
                {editingSubject ? 'Update' : 'Add'}
              </Button>
              <Button variant="outline" className="border-[#E2E8F0] hover:bg-[#F6F8FC] rounded-xl" onClick={() => setSubjectDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Confirmation Dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Reset {selectedYear} Year Data
              </DialogTitle>
              <DialogDescription>
                This action will permanently delete all subjects, labs, and lectures for {selectedYear} Year. This cannot be undone.
                Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetYearData}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Reset All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Hub View - Year Cards
  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#64748B]">
        <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Home</span>
        <span>→</span>
        <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Management</span>
        <span>→</span>
        <span className="font-semibold text-[#16A34A]">Subjects</span>
      </div>

      <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] rounded-t-2xl p-8">
          <CardTitle className="text-3xl font-semibold text-[#1E293B]">Manage Subjects</CardTitle>
          <CardDescription className="text-base text-[#64748B] mt-2">
            Select a year to manage labs and lectures
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {(['1st', '2nd', '3rd', '4th'] as Year[]).map((year) => (
              <Card
                key={year}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border border-[#E2E8F0] hover:border-[#16A34A] group bg-white min-h-[200px]"
                onClick={() => handleYearClick(year)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  <div className="bg-green-50 group-hover:bg-green-100 p-6 rounded-2xl transition-colors mb-4">
                    <BookOpen className="h-12 w-12 text-[#16A34A]" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-2xl text-[#1E293B] mb-2">{year} Year</h3>
                    <p className="text-sm text-[#64748B]">
                      Manage subjects for {year} year students
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
