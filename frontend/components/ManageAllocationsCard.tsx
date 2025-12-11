'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, FlaskConical, ArrowLeft, Pencil, RefreshCw, Search, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@heroui/react';
import { slotApi, SlotObservation } from '@/lib/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useSubjects } from '@/contexts/SubjectsContext';

const labs = [
  { id: '631', name: 'Lab 631' },
  { id: '632', name: 'Lab 632' },
  { id: '633', name: 'Lab 633' },
  { id: '634', name: 'Lab 634' },
  { id: '638', name: 'Lab 638' },
  { id: '515', name: 'Lab 515' },
];

const classes = [
  { id: '505', name: 'Class 505' },
  { id: '506', name: 'Class 506' },
  { id: '507', name: 'Class 507' },
  { id: '508', name: 'Class 508' },
];

const timeSlots = [
  { id: '1', label: '9:10 - 10:10', time: 'Slot 1' },
  { id: '2', label: '10:10 - 11:10', time: 'Slot 2' },
  { id: 'break1', label: '11:10 - 12:10', time: 'BREAK', isBreak: true },
  { id: '3', label: '12:10 - 13:10', time: 'Slot 3' },
  { id: '4', label: '13:10 - 14:10', time: 'Slot 4' },
  { id: 'break2', label: '14:10 - 14:20', time: 'BREAK', isBreak: true },
  { id: '5', label: '14:20 - 15:20', time: 'Slot 5' },
  { id: '6', label: '15:20 - 16:20', time: 'Slot 6' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const courseTypes = [
  { value: 'Lab', label: 'Lab' },
  { value: 'Theory', label: 'Theory' },
  { value: 'Tutorial', label: 'Tutorial' },
];

interface ManageAllocationsCardProps {
  onBack?: () => void;
}

export default function ManageAllocationsCard({ onBack }: ManageAllocationsCardProps) {
  const { labs: allLabs, lectures: allLectures, subjects: allSubjects } = useSubjects();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [observations, setObservations] = useState<SlotObservation[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ day: string; slot: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { toast } = useToast();

  // Debug: Log data on component load
  useEffect(() => {
    console.log('ManageAllocationsCard - Subjects:', allSubjects);
    console.log('ManageAllocationsCard - Labs:', allLabs);
    console.log('ManageAllocationsCard - Lectures:', allLectures);
  }, [allSubjects, allLabs, allLectures]);

  const [scheduleData, setScheduleData] = useState({
    subjectName: '',
    facultyName: '',
    division: '',
    batchName: '',
    semester: '',
  });

  // For dual batch labs (638, 515), track second batch allocation
  const [secondBatchData, setSecondBatchData] = useState({
    facultyName: '',
    batchName: '',
  });
  const [enableSecondBatch, setEnableSecondBatch] = useState(false);
  
  // Determine if current room is a lab or classroom
  const isLabRoom = labs.some(lab => lab.id === selectedRoom);
  
  // Check if current room supports dual batches (638 or 515)
  const isDualBatchLab = selectedRoom === '638' || selectedRoom === '515';
  
  // Get available subjects and faculty based on selection
  const getAvailableSubjects = () => {
    if (!selectedRoom) return [];
    
    if (isLabRoom) {
      // For labs: only show subjects that have this lab number in their labNumbers array
      const labsWithThisRoom = allLabs.filter(lab => 
        lab.labNumbers.includes(selectedRoom)
      );
      const subjectNames = [...new Set(labsWithThisRoom.map(lab => lab.subjectName))];
      return allSubjects.filter(subject => subjectNames.includes(subject.name));
    } else {
      // For classrooms: only show subjects that have this classroom number in their classRoomNumbers array
      const lecturesWithThisRoom = allLectures.filter(lecture => 
        lecture.classRoomNumbers.includes(selectedRoom)
      );
      const subjectNames = [...new Set(lecturesWithThisRoom.map(lecture => lecture.subjectName))];
      return allSubjects.filter(subject => subjectNames.includes(subject.name));
    }
  };
  
  const getAvailableFaculty = () => {
    if (!scheduleData.subjectName || !selectedRoom) return [];
    
    if (isLabRoom) {
      // For labs: only show faculty who teach this subject in this specific lab
      return allLabs
        .filter(lab => 
          lab.subjectName === scheduleData.subjectName && 
          lab.labNumbers.includes(selectedRoom)
        )
        .map(lab => lab.facultyName);
    } else {
      // For classrooms: only show faculty who teach this subject in this specific classroom
      return allLectures
        .filter(lecture => 
          lecture.subjectName === scheduleData.subjectName && 
          lecture.classRoomNumbers.includes(selectedRoom)
        )
        .map(lecture => lecture.facultyName);
    }
  };
  
  const getMatchingData = (): any => {
    if (!scheduleData.subjectName || !scheduleData.facultyName || !selectedRoom) return null;
    
    if (isLabRoom) {
      // For labs, find matching lab entry that includes this lab number
      return allLabs.find(
        lab => 
          lab.subjectName === scheduleData.subjectName && 
          lab.facultyName === scheduleData.facultyName &&
          lab.labNumbers.includes(selectedRoom)
      );
    } else {
      // For lectures, find matching lecture entry that includes this classroom number
      return allLectures.find(
        lecture => 
          lecture.subjectName === scheduleData.subjectName && 
          lecture.facultyName === scheduleData.facultyName &&
          lecture.classRoomNumbers.includes(selectedRoom)
      );
    }
  };
  
  // Auto-fill fields when subject and faculty are selected
  useEffect(() => {
    const matchingData = getMatchingData();
    if (matchingData) {
      if (isLabRoom) {
        setScheduleData(prev => ({
          ...prev,
          semester: matchingData.semester,
          batchName: matchingData.batchName,
          division: matchingData.division,
        }));
      } else {
        // For lectures, no batchName
        setScheduleData(prev => ({
          ...prev,
          semester: matchingData.semester,
          division: matchingData.division,
          batchName: '', // Clear batchName for lectures
        }));
      }
    }
  }, [scheduleData.subjectName, scheduleData.facultyName, isLabRoom]);

  // Auto-fill second batch fields when faculty is selected
  useEffect(() => {
    if (isDualBatchLab && enableSecondBatch && secondBatchData.facultyName && scheduleData.subjectName && selectedRoom) {
      const matchingLab = allLabs.find(
        lab => 
          lab.subjectName === scheduleData.subjectName && 
          lab.facultyName === secondBatchData.facultyName &&
          lab.labNumbers.includes(selectedRoom)
      );
      
      if (matchingLab && matchingLab.batchName) {
        setSecondBatchData(prev => ({
          ...prev,
          batchName: matchingLab.batchName,
        }));
      }
    }
  }, [secondBatchData.facultyName, scheduleData.subjectName, enableSecondBatch, isDualBatchLab, selectedRoom, allLabs]);

  useEffect(() => {
    if (selectedRoom) {
      fetchObservations();
    }
  }, [selectedRoom]);

  const fetchObservations = async () => {
    setIsLoading(true);
    try {
      const response = await slotApi.getAll();
      setObservations(response.data);
    } catch (error) {
      console.error('Failed to fetch observations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScheduleForSlot = (day: string, slotId: string) => {
    return observations.find(
      (obs) =>
        obs.location === selectedRoom &&
        obs.slotName.includes(day) &&
        obs.slotName.includes(`Slot ${slotId}`)
    );
  };

  const handleEditSlot = (day: string, slot: string) => {
    const existing = getScheduleForSlot(day, slot);
    
    console.log('Opening edit dialog for:', day, slot);
    console.log('Available subjects:', allSubjects);
    console.log('Available labs:', allLabs);
    console.log('Available lectures:', allLectures);
    
    if (existing) {
      const noteParts = existing.notes?.split(' | ') || [];
      const parts = existing.slotName.split(' - ');
      
      // Check if there's a second batch notation (for labs 638/515)
      const hasSecondBatch = existing.notes?.includes('Batch2:');
      
      setScheduleData({
        subjectName: parts[2] || '',
        facultyName: noteParts[0]?.replace('Faculty: ', '') || '',
        semester: noteParts[1]?.replace('Semester: ', '') || '',
        batchName: noteParts[2]?.replace('Batch: ', '') || '',
        division: noteParts[3]?.replace('Division: ', '') || noteParts[2]?.replace('Division: ', '') || '',
      });

      if (hasSecondBatch && isDualBatchLab) {
        setEnableSecondBatch(true);
        const faculty2Part = noteParts.find(p => p.startsWith('Faculty2:'));
        const batch2Part = noteParts.find(p => p.startsWith('Batch2:'));
        setSecondBatchData({
          facultyName: faculty2Part?.replace('Faculty2: ', '') || '',
          batchName: batch2Part?.replace('Batch2: ', '') || '',
        });
      } else {
        setEnableSecondBatch(false);
        setSecondBatchData({ facultyName: '', batchName: '' });
      }
    } else {
      setScheduleData({
        subjectName: '',
        facultyName: '',
        semester: '',
        batchName: '',
        division: '',
      });
      setEnableSecondBatch(false);
      setSecondBatchData({ facultyName: '', batchName: '' });
    }
    
    setCurrentEdit({ day, slot });
    setEditDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!currentEdit || !selectedRoom) return;

    const slotName = `${currentEdit.day} - Slot ${currentEdit.slot} - ${scheduleData.subjectName}`;
    
    let noteParts: string[];
    if (isLabRoom) {
      noteParts = [
        `Faculty: ${scheduleData.facultyName}`,
        `Semester: ${scheduleData.semester}`,
        `Batch: ${scheduleData.batchName}`,
        `Division: ${scheduleData.division}`
      ];

      // Add second batch info for dual batch labs (638, 515)
      if (isDualBatchLab && enableSecondBatch && secondBatchData.facultyName && secondBatchData.batchName) {
        noteParts.push(`Faculty2: ${secondBatchData.facultyName}`);
        noteParts.push(`Batch2: ${secondBatchData.batchName}`);
      }
    } else {
      // For lectures, no batch name
      noteParts = [
        `Faculty: ${scheduleData.facultyName}`,
        `Semester: ${scheduleData.semester}`,
        `Division: ${scheduleData.division}`
      ];
    }
    const notes = noteParts.join(' | ');

    setIsSaving(true);
    try {
      const existing = getScheduleForSlot(currentEdit.day, currentEdit.slot);

      if (scheduleData.subjectName.trim() === '') {
        // Delete if subject name is empty
        if (existing) {
          await slotApi.delete(existing.id);
          toast({
            title: 'Success',
            description: 'Schedule cleared successfully',
          });
        }
      } else {
        if (existing) {
          await slotApi.update(existing.id, {
            slotName,
            location: selectedRoom,
            amount: 0,
            status: 'Active',
            notes,
          });
          toast({
            title: 'Success',
            description: 'Schedule updated successfully',
          });
        } else {
          await slotApi.create({
            slotName,
            location: selectedRoom,
            amount: 0,
            status: 'Active',
            notes,
          });
          toast({
            title: 'Success',
            description: 'Schedule added successfully',
          });
        }
      }

      setEditDialogOpen(false);
      setCurrentEdit(null);
      setScheduleData({ subjectName: '', facultyName: '', semester: '', batchName: '', division: '' });
      fetchObservations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save schedule',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    setIsDeleting(true);
    try {
      // Fetch all observations
      const response = await slotApi.getAll();
      const allObservations = response.data;
      
      // Delete all observations
      for (const obs of allObservations) {
        await slotApi.delete(obs.id);
      }
      
      toast({
        title: 'Success',
        description: `Successfully deleted ${allObservations.length} allocation(s)`,
      });
      
      // Refresh the observations list
      fetchObservations();
      setShowResetConfirm(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset allocations',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (selectedRoom) {
    const roomName = [...labs, ...classes].find((r) => r.id === selectedRoom)?.name || selectedRoom;

    return (
      <div className="space-y-6 animate-in fade-in duration-1000">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Home</span>
          <span>→</span>
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Management</span>
          <span>→</span>
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={() => setSelectedRoom(null)}>Allocations</span>
          <span>→</span>
          <span className="font-semibold text-[#1E293B]">{roomName}</span>
        </div>

        <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-[#F6F8FC] rounded-xl" onClick={() => setSelectedRoom(null)}>
                <ArrowLeft className="h-5 w-5 text-[#2563EB]" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-semibold text-[#1E293B]">{roomName} - Timetable</CardTitle>
                <CardDescription className="text-base text-[#64748B] mt-1">View and edit schedule for this room</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-[#E2E8F0] hover:bg-[#F6F8FC] rounded-xl"
              onClick={fetchObservations}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 text-[#2563EB] ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto animate-in fade-in duration-1000">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-semibold text-left min-w-[100px]">Day</th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`border p-2 font-semibold text-center min-w-[140px] ${
                        slot.isBreak ? 'bg-gray-200 dark:bg-gray-800' : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs">{slot.time}</div>
                      <div className="text-xs text-muted-foreground">{slot.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day}>
                    <td className="border p-2 font-medium bg-muted">{day}</td>
                    {timeSlots.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="border p-2 text-center bg-gray-100 dark:bg-gray-900 text-muted-foreground"
                          >
                            BREAK
                          </td>
                        );
                      }

                      const schedule = getScheduleForSlot(day, slot.id);

                      return (
                        <td key={slot.id} className="border p-2 relative group">
                          {schedule ? (
                            <div className="text-xs">
                              <p className="font-semibold">{schedule.slotName.split(' - ')[2]}</p>
                              {schedule.notes && (
                                <>
                                  <p className="text-muted-foreground text-[10px] mt-1">
                                    {schedule.notes.split(' | ')[0]?.replace('Faculty: ', '')}
                                  </p>
                                  {schedule.notes.includes('Batch:') && (
                                    <p className="text-muted-foreground text-[10px]">
                                      {schedule.notes.split(' | ').find(p => p.includes('Batch:'))?.replace('Batch: ', '')}
                                    </p>
                                  )}
                                  {schedule.notes.includes('Division') && (
                                    <p className="text-muted-foreground text-[10px]">
                                      {schedule.notes.split(' | ').find(p => p.includes('Division:'))?.replace('Division: ', '')}
                                    </p>
                                  )}
                                  {/* Show second batch for labs 638/515 */}
                                  {schedule.notes.includes('Faculty2:') && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <p className="text-blue-600 text-[10px] font-semibold">
                                        {schedule.notes.split(' | ').find(p => p.includes('Faculty2:'))?.replace('Faculty2: ', '')}
                                      </p>
                                      <p className="text-blue-600 text-[10px]">
                                        {schedule.notes.split(' | ').find(p => p.includes('Batch2:'))?.replace('Batch2: ', '')}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground text-center">-</div>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditSlot(day, slot.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Schedule - {isLabRoom ? 'Lab' : 'Lecture'}</DialogTitle>
                <DialogDescription>
                  {currentEdit && `${currentEdit.day} - Slot ${currentEdit.slot} - ${roomName}`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject</Label>
                  <Select
                    value={scheduleData.subjectName}
                    onValueChange={(value) => setScheduleData({ ...scheduleData, subjectName: value, facultyName: '', semester: '', batchName: '', division: '' })}
                  >
                    <SelectTrigger id="subjectName">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSubjects().length === 0 ? (
                        <SelectItem value="no-subject" disabled>
                          No subjects added yet
                        </SelectItem>
                      ) : (
                        getAvailableSubjects().map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name} ({subject.year} Year)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facultyName">Faculty</Label>
                  <Select
                    value={scheduleData.facultyName}
                    onValueChange={(value) => setScheduleData({ ...scheduleData, facultyName: value })}
                    disabled={!scheduleData.subjectName}
                  >
                    <SelectTrigger id="facultyName">
                      <SelectValue placeholder={scheduleData.subjectName ? "Select faculty" : "Select subject first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFaculty().length === 0 ? (
                        <SelectItem value="no-faculty" disabled>
                          No faculty found for this subject
                        </SelectItem>
                      ) : (
                        getAvailableFaculty().map((faculty, index) => (
                          <SelectItem key={index} value={faculty}>
                            {faculty}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    value={scheduleData.semester}
                    readOnly
                    placeholder="Auto-filled"
                    className="bg-gray-50"
                  />
                </div>

                {isLabRoom && (
                  <div className="space-y-2">
                    <Label htmlFor="batchName">Batch</Label>
                    <Input
                      id="batchName"
                      value={scheduleData.batchName}
                      readOnly
                      placeholder="Auto-filled"
                      className="bg-gray-50"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="division">Division</Label>
                  <Input
                    id="division"
                    value={scheduleData.division}
                    readOnly
                    placeholder="Auto-filled"
                    className="bg-gray-50"
                  />
                </div>

                {/* Second Batch Section for Labs 638 and 515 */}
                {isDualBatchLab && isLabRoom && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Second Batch (Optional)</Label>
                      <input
                        type="checkbox"
                        checked={enableSecondBatch}
                        onChange={(e) => {
                          setEnableSecondBatch(e.target.checked);
                          if (!e.target.checked) {
                            setSecondBatchData({ facultyName: '', batchName: '' });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </div>
                    
                    {enableSecondBatch && (
                      <>
                        <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                          <Label htmlFor="faculty2">Faculty (Batch 2)</Label>
                          <Select
                            value={secondBatchData.facultyName}
                            onValueChange={(value) => setSecondBatchData({ ...secondBatchData, facultyName: value })}
                            disabled={!scheduleData.subjectName}
                          >
                            <SelectTrigger id="faculty2">
                              <SelectValue placeholder="Select faculty for batch 2" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableFaculty().length === 0 ? (
                                <SelectItem value="no-faculty" disabled>
                                  No faculty found
                                </SelectItem>
                              ) : (
                                getAvailableFaculty().map((faculty, index) => (
                                  <SelectItem key={index} value={faculty}>
                                    {faculty}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2 bg-blue-50 p-3 rounded-lg">
                          <Label htmlFor="batch2">Batch Name (Batch 2)</Label>
                          <Input
                            id="batch2"
                            value={secondBatchData.batchName}
                            readOnly
                            placeholder="Auto-filled from Manage Subjects"
                            className="bg-gray-50"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveSchedule} className="flex-1" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner size="sm" color="white" variant="default" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Schedule'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Home</span>
          <span>→</span>
          <span className="hover:text-[#2563EB] cursor-pointer" onClick={onBack}>Management</span>
          <span>→</span>
          <span className="font-semibold text-[#2563EB]">Allocations</span>
        </div>
      </div>
      <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] rounded-t-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-semibold text-[#1E293B]">Manage Allocations</CardTitle>
            <CardDescription className="text-base text-[#64748B] mt-2">Manage schedules for labs and classes</CardDescription>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-500 hover:bg-red-600 rounded-xl"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Reset All Allocations
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Labs Section */}
          <div className="bg-[#F6F8FC] p-6 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-l-4 border-[#2563EB] pl-4">
              <div className="bg-blue-50 p-3 rounded-xl">
                <FlaskConical className="h-5 w-5 text-[#2563EB]" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#1E293B]">Labs</h3>
                <p className="text-sm text-[#64748B]">Laboratory Rooms</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {labs.map((lab) => (
                <Card
                  key={lab.id}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB] bg-white min-h-[140px] flex items-center justify-center group"
                  onClick={() => setSelectedRoom(lab.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-blue-50 group-hover:bg-blue-100 p-4 rounded-2xl transition-colors">
                        <FlaskConical className="h-7 w-7 text-[#2563EB]" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xl text-[#1E293B]">{lab.id}</p>
                        <p className="text-sm text-[#64748B] font-medium">{lab.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Classes Section */}
          <div className="bg-[#F6F8FC] p-6 rounded-2xl border border-[#E2E8F0]">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-l-4 border-[#16A34A] pl-4">
              <div className="bg-green-50 p-3 rounded-xl">
                <School className="h-5 w-5 text-[#16A34A]" />
              </div>
              <div>
                <h3 className="font-semibold text-xl text-[#1E293B]">Classes</h3>
                <p className="text-sm text-[#64748B]">Classroom Rooms</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((classroom) => (
                <Card
                  key={classroom.id}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl border border-[#E2E8F0] hover:border-[#16A34A] bg-white min-h-[140px] flex items-center justify-center group"
                  onClick={() => setSelectedRoom(classroom.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="bg-green-50 group-hover:bg-green-100 p-4 rounded-2xl transition-colors">
                        <School className="h-7 w-7 text-[#16A34A]" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xl text-[#1E293B]">{classroom.id}</p>
                        <p className="text-sm text-[#64748B] font-medium">{classroom.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>

    {/* Reset Confirmation Dialog */}
    <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Reset All Allocations
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all slot observations and allocations. This cannot be undone.
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
            onClick={handleResetAll}
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
    </>
  );
}
