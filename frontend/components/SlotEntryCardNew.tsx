'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { slotApi, SlotObservation } from '@/lib/api';
import { Calendar, RefreshCw, Pencil, Users, MessageSquare, Download, FlaskConical, BookOpen, Mail, ArrowLeft } from 'lucide-react';
import { Spinner } from '@heroui/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const timeSlots = [
  { id: '1', label: '9:10 - 10:10 AM', time: 'Slot 1' },
  { id: '2', label: '10:10 - 11:10 AM', time: 'Slot 2' },
  { id: 'break1', label: '11:10 - 12:10 PM', time: 'BREAK', isBreak: true },
  { id: '3', label: '12:10 - 1:10 PM', time: 'Slot 3' },
  { id: '4', label: '1:10 - 2:10 PM', time: 'Slot 4' },
  { id: 'break2', label: '2:10 - 2:20 PM', time: 'BREAK', isBreak: true },
  { id: '5', label: '2:20 - 3:20 PM', time: 'Slot 5' },
  { id: '6', label: '3:20 - 4:20 PM', time: 'Slot 6' },
];

const labSlots = [
  { id: '1-2', label: '9:10 - 11:10 AM', time: 'Lab Session 1', slots: ['1', '2'] },
  { id: 'break1', label: '11:10 - 12:10 PM', time: 'BREAK', isBreak: true },
  { id: '3-4', label: '12:10 - 2:10 PM', time: 'Lab Session 2', slots: ['3', '4'] },
  { id: 'break2', label: '2:10 - 2:20 PM', time: 'BREAK', isBreak: true },
  { id: '5-6', label: '2:20 - 4:20 PM', time: 'Lab Session 3', slots: ['5', '6'] },
];

const rooms = [
  { id: '631', name: 'Lab 631', type: 'Lab' },
  { id: '632', name: 'Lab 632', type: 'Lab' },
  { id: '633', name: 'Lab 633', type: 'Lab' },
  { id: '634', name: 'Lab 634', type: 'Lab' },
  { id: '638', name: 'Lab 638', type: 'Lab' },
  { id: '515', name: 'Lab 515', type: 'Lab' },
];

const classrooms = [
  { id: '505', name: 'Class 505', type: 'Class' },
  { id: '506', name: 'Class 506', type: 'Class' },
  { id: '507', name: 'Class 507', type: 'Class' },
  { id: '508', name: 'Class 508', type: 'Class' },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getCurrentDay = () => {
  const dayIndex = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[dayIndex];
  // Default to Monday if it's Sunday
  return currentDay === 'Sunday' ? 'Monday' : currentDay;
};

interface SlotEntryCardProps {
  onBack?: () => void;
}

export default function SlotEntryCard({ onBack }: SlotEntryCardProps = {}) {
  const [observations, setObservations] = useState<SlotObservation[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentDay());
  const [loading, setLoading] = useState(false);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<{ room: string; slot: string; schedule: SlotObservation | null } | null>(null);
  const [attendanceData, setAttendanceData] = useState({
    presentStudents: '',
    remarks: '',
  });
  const { toast } = useToast();

  const fetchObservations = async () => {
    setLoading(true);
    try {
      const response = await slotApi.getAll();
      console.log('SlotEntryCardNew - Fetched observations:', response.data.length);
      console.log('SlotEntryCardNew - Sample data:', response.data[0]);
      setObservations(response.data);
    } catch (error: any) {
      console.error('SlotEntryCardNew - Failed to fetch observations:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
    
    // Auto-refresh every 30 seconds to reflect changes
    const intervalId = setInterval(() => {
      fetchObservations();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getScheduleForSlot = (day: string, room: string, slotId: string) => {
    return observations.find(
      (obs) =>
        obs.slotName.includes(day) &&
        obs.location === room &&
        obs.slotName.includes(`Slot ${slotId}`)
    );
  };

  const getScheduleForLabSession = (day: string, room: string, slots: string[]) => {
    // Get schedule for the first slot in the lab session
    return getScheduleForSlot(day, room, slots[0]);
  };

  const handleEditSlot = (room: string, slotId: string) => {
    const schedule = getScheduleForSlot(selectedDay, room, slotId);
    
    if (schedule) {
      // Parse existing attendance data from amount field and status field
      setAttendanceData({
        presentStudents: schedule.amount?.toString() || '',
        remarks: schedule.status || '',
      });
    } else {
      setAttendanceData({
        presentStudents: '',
        remarks: '',
      });
    }
    
    setCurrentEdit({ room, slot: slotId, schedule: schedule || null });
    setEditDialogOpen(true);
  };

  const handleSaveAttendance = async () => {
    if (!currentEdit) return;

    const { room, schedule } = currentEdit;

    if (!schedule) {
      toast({
        title: 'Error',
        description: 'No class scheduled for this slot',
        variant: 'destructive',
      });
      return;
    }

    // Determine max capacity based on room type
    const presentCount = parseFloat(attendanceData.presentStudents) || 0;
    let maxCapacity = 60; // Default for lectures/classes
    let roomType = 'Class';

    // Check if it's a lab
    const roomInfo = rooms.find(r => r.id === room);
    if (roomInfo && roomInfo.type === 'Lab') {
      roomType = 'Lab';
      // Special labs 638 and 515 have capacity 40, others have 20
      if (room === '638' || room === '515') {
        maxCapacity = 40;
      } else {
        maxCapacity = 20;
      }
    }

    // Validate attendance doesn't exceed capacity
    if (presentCount > maxCapacity) {
      toast({
        title: 'Invalid Attendance',
        description: `Cannot enter attendance greater than maximum capacity. Present count (${presentCount}) exceeds capacity (${maxCapacity}) for ${roomType} ${room}. Please enter attendance ≤ ${maxCapacity}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsSavingAttendance(true);
    try {
      await slotApi.update(schedule.id, {
        ...schedule,
        amount: presentCount,
        status: attendanceData.remarks || schedule.status,
      });

      toast({
        title: 'Success',
        description: 'Attendance updated successfully',
      });

      setEditDialogOpen(false);
      setCurrentEdit(null);
      setAttendanceData({ presentStudents: '', remarks: '' });
      fetchObservations();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update attendance',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const sendEmailReport = async () => {
    setSendingEmail(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to send emails.',
          variant: 'destructive',
        });
        setSendingEmail(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.16.5.200:3001';
      console.log('Sending email request to:', `${apiUrl}/email/send-manual-report`);
      
      const response = await fetch(`${apiUrl}/email/send-manual-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      console.log('Email response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Email sent successfully:', result);
        toast({
          title: 'Email Sent Successfully!',
          description: 'Today\'s attendance report has been sent via email.',
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Email send failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to send email');
      }
    } catch (error: any) {
      console.error('Failed to send email:', error);
      let errorMessage = 'Please check your email configuration and backend logs.';
      
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
      } else if (error.message?.includes('ETIMEDOUT') || error.message?.includes('timeout')) {
        errorMessage = 'Email server connection timeout. Your network may be blocking SMTP ports (587/465). Please contact your network administrator.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Failed to Send Email',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Function to load image from URL and convert to base64
      const loadImage = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } else {
              reject(new Error('Failed to get canvas context'));
            }
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = src;
        });
      };
      
      // Load and add CHARUSAT logo
      try {
        const charusatLogo = await loadImage('/CHARUSAT_logo.png');
        doc.addImage(charusatLogo, 'PNG', 12, 8, 30, 25);
      } catch (error) {
        console.error('Failed to load CHARUSAT logo:', error);
        // Fallback
        doc.setFillColor(0, 82, 155);
        doc.rect(12, 8, 30, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('CHARUSAT', 27, 20.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Load and add CSPIT logo
      try {
        const cspitLogo = await loadImage('/cspit_logo.png');
        doc.addImage(cspitLogo, 'PNG', pageWidth - 42, 8, 30, 25);
      } catch (error) {
        console.error('Failed to load CSPIT logo:', error);
        // Fallback
        doc.setFillColor(0, 82, 155);
        doc.rect(pageWidth - 42, 8, 30, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('CSPIT', pageWidth - 27, 20.5, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
      
      // Reset text color to black
      doc.setTextColor(0, 0, 0);
      
      // Header - University name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Charotar University of Science and Technology', pageWidth / 2, 15, { align: 'center' });
      
      // Subheader - Department
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Computer Science and Engineering Department', pageWidth / 2, 22, { align: 'center' });
      doc.text('Chandubhai S Patel Institute of Technology (CSPIT)', pageWidth / 2, 28, { align: 'center' });
      
      // Date and Time
      doc.setFontSize(10);
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const timeStr = now.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      doc.text(`Date: ${dateStr} | Time: ${timeStr}`, pageWidth / 2, 35, { align: 'center' });
      doc.text(`Day: ${selectedDay}`, pageWidth / 2, 41, { align: 'center' });
      
      // Line separator
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 45, pageWidth - 10, 45);
      
      let yPosition = 51;
    
    // Labs Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LABS', 14, yPosition);
    yPosition += 8;
    
    const labRooms = rooms.filter(r => r.type === 'Lab');
    const labData: any[] = [];
    
    labRooms.forEach((room) => {
      const row: any = { room: room.id };
      
      timeSlots.forEach((slot) => {
        if (!slot.isBreak) {
          const schedule = getScheduleForSlot(selectedDay, room.id, slot.id);
          if (schedule) {
            const courseName = schedule.slotName.split(' - ')[2] || '-';
            const instructor = schedule.notes?.split(', ')[1]?.replace('Instructor: ', '') || '-';
            const present = schedule.amount > 0 ? schedule.amount.toString() : '-';
            const remarks = schedule.status && schedule.status !== 'Active' ? schedule.status : '-';
            
            row[`slot${slot.id}`] = `${courseName}\n${instructor}\nPresent: ${present}\n${remarks}`;
          } else {
            row[`slot${slot.id}`] = '-';
          }
        }
      });
      
      labData.push(row);
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Room',
        'Slot 1\n9:10-10:10',
        'Slot 2\n10:10-11:10',
        'Slot 3\n12:10-13:10',
        'Slot 4\n13:10-14:10',
        'Slot 5\n14:20-15:20',
        'Slot 6\n15:20-16:20'
      ]],
      body: labData.map(row => [
        row.room,
        row.slot1,
        row.slot2,
        row.slot3,
        row.slot4,
        row.slot5,
        row.slot6
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
    
    // Classes Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LECTURES (Classes)', 14, yPosition);
    yPosition += 8;
    
    const classRooms = classrooms;  // Use classrooms array instead of filtering
    const classData: any[] = [];
    
    classRooms.forEach((room) => {
      const row: any = { room: room.id };
      
      timeSlots.forEach((slot) => {
        if (!slot.isBreak) {
          const schedule = getScheduleForSlot(selectedDay, room.id, slot.id);
          if (schedule) {
            const courseName = schedule.slotName.split(' - ')[2] || '-';
            const instructor = schedule.notes?.split(', ')[1]?.replace('Instructor: ', '') || '-';
            const present = schedule.amount > 0 ? schedule.amount.toString() : '-';
            const remarks = schedule.status && schedule.status !== 'Active' ? schedule.status : '-';
            
            row[`slot${slot.id}`] = `${courseName}\n${instructor}\nPresent: ${present}\n${remarks}`;
          } else {
            row[`slot${slot.id}`] = '-';
          }
        }
      });
      
      classData.push(row);
    });
    
    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Room',
        'Slot 1\n9:10-10:10',
        'Slot 2\n10:10-11:10',
        'Slot 3\n12:10-13:10',
        'Slot 4\n13:10-14:10',
        'Slot 5\n14:20-15:20',
        'Slot 6\n15:20-16:20'
      ]],
      body: classData.map(row => [
        row.room,
        row.slot1,
        row.slot2,
        row.slot3,
        row.slot4,
        row.slot5,
        row.slot6
      ]),
      theme: 'grid',
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        halign: 'center',
        valign: 'middle'
      },
      headStyles: { 
        fillColor: [92, 184, 92],
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240] }
      }
    });
    
    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `Timetable_${selectedDay}_${now.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast({
      title: 'Success',
      description: 'PDF downloaded successfully',
    });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
    <div className="space-y-8">
      {/* Back Button */}
      {onBack && (
        <div className="px-10">
          <Button
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      )}
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 px-10">
        <span className="text-gray-900 font-medium">Home</span>
        <span>→</span>
        <span className="font-semibold text-blue-600">Time & Attendance Tracking</span>
      </div>

    <div className="bg-gradient-to-b from-[#f8fafc] to-[#eef2ff] rounded-2xl p-10">
    <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Weekly Timetable</CardTitle>
              <CardDescription className="text-sm">Track attendance and manage weekly schedules</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchObservations}
              disabled={loading}
              className="transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={sendEmailReport}
              disabled={sendingEmail}
              className="transition-all duration-200 hover:scale-105"
            >
              {sendingEmail ? (
                <>
                  <Spinner size="sm" variant="dots" className="mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePrintPDF}
              disabled={isGeneratingPDF}
              className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 hover:scale-105"
            >
              {isGeneratingPDF ? (
                <>
                  <Spinner size="sm" variant="dots" className="mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Current Date Display */}
        <div className="flex items-center justify-center gap-3 pt-4 border-t">
          <div className="flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-lg border border-blue-200">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-base font-semibold text-gray-800">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-8">
        {/* Labs Section */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-blue-500" /> Labs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-semibold text-left sticky left-0 z-10 bg-background min-w-[120px]">
                    Room
                  </th>
                  {labSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`border p-2 font-semibold text-center min-w-[140px] ${
                        slot.isBreak ? 'bg-gray-200 dark:bg-gray-800' : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs font-semibold">{slot.time}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        {slot.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-muted/50">
                    <td className="border p-2 font-medium sticky left-0 z-10 bg-background">
                      <div>
                        <div className="font-semibold">{room.id}</div>
                        <div className="text-xs text-muted-foreground">{room.type}</div>
                      </div>
                    </td>
                    {labSlots.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="border p-2 text-center bg-gray-100 dark:bg-gray-900 text-muted-foreground"
                          >
                            <span className="text-xs">BREAK</span>
                          </td>
                        );
                      }

                      const schedule = getScheduleForLabSession(selectedDay, room.id, slot.slots!);

                      return (
                        <td key={slot.id} className="border p-1.5 relative group">
                          {schedule ? (
                            <div className="text-xs">
                              <p className="font-semibold text-[11px] leading-tight">
                                {schedule.slotName.split(' - ')[2]}
                              </p>
                              {schedule.notes && (
                                <>
                                  <p className="text-muted-foreground text-[9px] mt-0.5">
                                    {schedule.notes.split(' | ')[0]?.replace('Faculty: ', '')}
                                  </p>
                                  {schedule.notes.includes('Batch:') && (
                                    <p className="text-muted-foreground text-[9px]">
                                      {schedule.notes.split(' | ').find(p => p.includes('Batch:'))?.replace('Batch: ', '')}
                                    </p>
                                  )}
                                  {/* Show second batch if present */}
                                  {schedule.notes.includes('Faculty2:') && (
                                    <div className="mt-1 pt-1 border-t border-blue-200">
                                      <p className="text-blue-600 text-[9px]">
                                        {schedule.notes.split(' | ').find(p => p.includes('Faculty2:'))?.replace('Faculty2: ', '')}
                                      </p>
                                      <p className="text-blue-600 text-[9px]">
                                        {schedule.notes.split(' | ').find(p => p.includes('Batch2:'))?.replace('Batch2: ', '')}
                                      </p>
                                    </div>
                                  )}
                                </>
                              )}
                              {schedule.amount > 0 && (
                                <div className="flex items-center gap-1 mt-1 text-[9px] text-green-600">
                                  <Users className="h-2.5 w-2.5" />
                                  <span>{schedule.amount}</span>
                                </div>
                              )}
                              {schedule.status && schedule.status !== 'Active' && (
                                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-blue-600">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  <span className="truncate">{schedule.status}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-xs">-</div>
                          )}
                          {schedule && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEditSlot(room.id, slot.slots![0])}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lectures Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" /> Lectures
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted font-semibold text-left sticky left-0 z-10 bg-background min-w-[120px]">
                    Room
                  </th>
                  {timeSlots.map((slot) => (
                    <th
                      key={slot.id}
                      className={`border p-2 font-semibold text-center min-w-[140px] ${
                        slot.isBreak ? 'bg-gray-200 dark:bg-gray-800' : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs font-semibold">{slot.time}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">
                        {slot.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classrooms.map((room) => (
                  <tr key={room.id} className="hover:bg-muted/50">
                    <td className="border p-2 font-medium sticky left-0 z-10 bg-background">
                      <div>
                        <div className="font-semibold">{room.id}</div>
                        <div className="text-xs text-muted-foreground">{room.type}</div>
                      </div>
                    </td>
                    {timeSlots.map((slot) => {
                      if (slot.isBreak) {
                        return (
                          <td
                            key={slot.id}
                            className="border p-2 text-center bg-gray-100 dark:bg-gray-900 text-muted-foreground"
                          >
                            <span className="text-xs">BREAK</span>
                          </td>
                        );
                      }

                      const schedule = getScheduleForSlot(selectedDay, room.id, slot.id);

                      return (
                        <td key={slot.id} className="border p-1.5 relative group">
                          {schedule ? (
                            <div className="text-xs">
                              <p className="font-semibold text-[11px] leading-tight">
                                {schedule.slotName.split(' - ')[2]}
                              </p>
                              {schedule.notes && (
                                <p className="text-muted-foreground text-[9px] mt-0.5">
                                  {schedule.notes.split(', ')[1]?.replace('Instructor: ', '')}
                                </p>
                              )}
                              {schedule.amount > 0 && (
                                <div className="flex items-center gap-1 mt-1 text-[9px] text-green-600">
                                  <Users className="h-2.5 w-2.5" />
                                  <span>{schedule.amount}</span>
                                </div>
                              )}
                              {schedule.status && schedule.status !== 'Active' && (
                                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-blue-600">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  <span className="truncate">{schedule.status}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground text-xs">-</div>
                          )}
                          {schedule && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleEditSlot(room.id, slot.id)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="overflow-x-auto hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border p-2 bg-muted font-semibold text-left sticky left-0 z-10 bg-background min-w-[120px]">
                  Room
                </th>
                {timeSlots.map((slot) => (
                  <th
                    key={slot.id}
                    className={`border p-2 font-semibold text-center min-w-[140px] ${
                      slot.isBreak ? 'bg-gray-200 dark:bg-gray-800' : 'bg-muted'
                    }`}
                  >
                    <div className="text-xs font-semibold">{slot.time}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">
                      {slot.label}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-muted/50">
                  <td className="border p-2 font-medium sticky left-0 z-10 bg-background">
                    <div>
                      <div className="font-semibold">{room.id}</div>
                      <div className="text-xs text-muted-foreground">{room.type}</div>
                    </div>
                  </td>
                  {timeSlots.map((slot) => {
                    if (slot.isBreak) {
                      return (
                        <td
                          key={slot.id}
                          className="border p-2 text-center bg-gray-100 dark:bg-gray-900 text-muted-foreground"
                        >
                          <span className="text-xs">BREAK</span>
                        </td>
                      );
                    }

                    const schedule = getScheduleForSlot(selectedDay, room.id, slot.id);

                    return (
                      <td key={slot.id} className="border p-1.5 relative group">
                        {schedule ? (
                          <div className="text-xs">
                            <p className="font-semibold text-[11px] leading-tight">
                              {schedule.slotName.split(' - ')[2]}
                            </p>
                            {schedule.notes && (
                              <p className="text-muted-foreground text-[9px] mt-0.5">
                                {schedule.notes.split(', ')[1]?.replace('Instructor: ', '')}
                              </p>
                            )}
                            {schedule.amount > 0 && (
                              <div className="flex items-center gap-1 mt-1 text-[9px] text-green-600">
                                <Users className="h-2.5 w-2.5" />
                                <span>{schedule.amount}</span>
                              </div>
                            )}
                            {schedule.status && schedule.status !== 'Active' && (
                              <div className="flex items-center gap-1 mt-0.5 text-[9px] text-blue-600">
                                <MessageSquare className="h-2.5 w-2.5" />
                                <span className="truncate">{schedule.status}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-xs">-</div>
                        )}
                        {schedule && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-0.5 right-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEditSlot(room.id, slot.id)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted border"></div>
            <span>Regular Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-200 dark:bg-gray-800 border"></div>
            <span>Break Time</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3 w-3 text-green-600" />
            <span>Present Students</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-3 w-3 text-blue-600" />
            <span>Remarks</span>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Attendance</DialogTitle>
              <DialogDescription>
                {currentEdit && currentEdit.schedule && (
                  <div className="mt-2">
                    <p className="font-semibold">{currentEdit.schedule.slotName.split(' - ')[2]}</p>
                    <p className="text-sm">Room: {currentEdit.room} • Slot {currentEdit.slot}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Max Capacity: {
                        (() => {
                          const roomInfo = rooms.find(r => r.id === currentEdit.room);
                          if (roomInfo && roomInfo.type === 'Lab') {
                            return (currentEdit.room === '638' || currentEdit.room === '515') ? '40' : '20';
                          }
                          return '60';
                        })()
                      } students
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="presentStudents">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Present Students
                  </div>
                </Label>
                <Input
                  id="presentStudents"
                  type="number"
                  value={attendanceData.presentStudents}
                  onChange={(e) => setAttendanceData({ ...attendanceData, presentStudents: e.target.value })}
                  placeholder="Enter number of students present"
                  min="0"
                  max={
                    (() => {
                      if (!currentEdit) return undefined;
                      const roomInfo = rooms.find(r => r.id === currentEdit.room);
                      if (roomInfo && roomInfo.type === 'Lab') {
                        return (currentEdit.room === '638' || currentEdit.room === '515') ? 40 : 20;
                      }
                      return 60;
                    })()
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Remarks
                  </div>
                </Label>
                <Textarea
                  id="remarks"
                  value={attendanceData.remarks}
                  onChange={(e) => setAttendanceData({ ...attendanceData, remarks: e.target.value })}
                  placeholder="Add any remarks or notes about this class"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveAttendance} className="flex-1" disabled={isSavingAttendance}>
                {isSavingAttendance ? (
                  <>
                    <Spinner size="sm" color="white" variant="dots" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Attendance'
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSavingAttendance}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </div>
    </div>
    </>
  );
}
