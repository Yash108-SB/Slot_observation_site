'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useFaculty } from '@/contexts/FacultyContext';

interface ManageFacultiesCardProps {
  onBack?: () => void;
}

const departments = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Electrical',
  'Mechanical',
  'Civil',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Other',
];

export default function ManageFacultiesCard({ onBack }: ManageFacultiesCardProps) {
  const { faculties, addFaculty, updateFaculty, deleteFaculty } = useFaculty();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', department: '' });
  const { toast } = useToast();

  // Debug: Log faculties when component renders or faculties change
  useEffect(() => {
    console.log('ManageFacultiesCard - Current faculties:', faculties);
  }, [faculties]);

  const handleAddClick = () => {
    setEditingFacultyId(null);
    setFormData({ name: '', department: '' });
    setDialogOpen(true);
  };

  const handleEditClick = (faculty: { id: number; name: string; department: string }) => {
    setEditingFacultyId(faculty.id);
    setFormData({ name: faculty.name, department: faculty.department });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.department) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (editingFacultyId) {
      // Edit existing faculty
      console.log('Updating faculty:', editingFacultyId, formData);
      updateFaculty(editingFacultyId, formData);
      toast({
        title: 'Success',
        description: 'Faculty updated successfully',
      });
    } else {
      // Add new faculty
      const newFaculty = {
        id: Date.now(),
        name: formData.name,
        department: formData.department,
      };
      console.log('Adding new faculty:', newFaculty);
      addFaculty(newFaculty);
      toast({
        title: 'Success',
        description: 'Faculty added successfully',
      });
    }

    setDialogOpen(false);
    setFormData({ name: '', department: '' });
  };

  const handleDelete = (id: number) => {
    deleteFaculty(id);
    toast({
      title: 'Success',
      description: 'Faculty deleted successfully',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-[#64748B]">
        <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Home</span>
        <span>→</span>
        <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Management</span>
        <span>→</span>
        <span className="font-semibold text-[#DC2626]">Faculties</span>
      </div>

      <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-[#FEF2F2] to-[#FEE2E2] rounded-t-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-semibold text-[#1E293B]">Manage Faculties</CardTitle>
              <CardDescription className="text-base text-[#64748B] mt-2">
                Add, edit, and manage faculty members ({faculties.length} total)
              </CardDescription>
            </div>
            <Button className="bg-[#DC2626] hover:bg-[#B91C1C] shadow-sm rounded-xl" onClick={handleAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {faculties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-red-50 p-8 rounded-2xl mb-6">
                <User className="h-14 w-14 text-[#DC2626]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1E293B] mb-2">No Faculty Members Yet</h3>
              <p className="text-[#64748B] max-w-md text-base">
                Get started by adding your first faculty member. Click the "Add Faculty" button above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {faculties.map((faculty) => (
                <Card key={faculty.id} className="hover:shadow-lg transition-all duration-300 rounded-2xl border border-[#E2E8F0] bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-red-50 p-3 rounded-xl flex-shrink-0">
                        <User className="h-6 w-6 text-[#DC2626]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-[#1E293B] mb-1 truncate">{faculty.name}</h3>
                        <p className="text-sm text-[#64748B]">{faculty.department}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-[#E2E8F0]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-[#F6F8FC]"
                        onClick={() => handleEditClick(faculty)}
                      >
                        <Pencil className="h-4 w-4 mr-1 text-[#2563EB]" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg border-[#E2E8F0] hover:bg-red-50"
                        onClick={() => handleDelete(faculty.id)}
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
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFacultyId ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
            <DialogDescription>
              {editingFacultyId ? 'Update the faculty member details' : 'Enter the details of the new faculty member'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Faculty Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Dr. John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value })}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] shadow-sm rounded-xl">
              {editingFacultyId ? 'Update' : 'Add'} Faculty
            </Button>
            <Button variant="outline" className="border-[#E2E8F0] hover:bg-[#F6F8FC] rounded-xl" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
