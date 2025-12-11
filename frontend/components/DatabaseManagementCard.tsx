'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, BookOpen, Calendar, ArrowLeft } from 'lucide-react';
import ManageFacultiesCard from './ManageFacultiesCard';
import ManageSubjectsCard from './ManageSubjectsCard';
import ManageAllocationsCard from './ManageAllocationsCard';
import { FacultyProvider } from '@/contexts/FacultyContext';
import { SubjectsProvider } from '@/contexts/SubjectsContext';

type ManagementView = 'hub' | 'faculties' | 'subjects' | 'allocations';

interface DatabaseManagementCardProps {
  onBack?: () => void;
}

export default function DatabaseManagementCard({ onBack }: DatabaseManagementCardProps = {}) {
  const [currentView, setCurrentView] = useState<ManagementView>('hub');

  return (
    <FacultyProvider>
      <SubjectsProvider>
      {/* Handle navigation to sub-views */}
      {currentView === 'faculties' && (
        <ManageFacultiesCard onBack={() => setCurrentView('hub')} />
      )}

      {currentView === 'subjects' && (
        <ManageSubjectsCard onBack={() => setCurrentView('hub')} />
      )}

      {currentView === 'allocations' && (
        <ManageAllocationsCard onBack={() => setCurrentView('hub')} />
      )}

      {currentView === 'hub' && (
        <div className="space-y-6">
          {/* Back Button */}
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          )}
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="text-[#1E293B] font-medium">Home</span>
            <span>→</span>
            <span className="font-semibold text-[#2563EB]">Database Management</span>
          </div>

          <Card className="w-full shadow-md rounded-2xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-[#F6F8FC] to-[#EFF6FF] rounded-t-2xl p-8">
              <CardTitle className="text-3xl font-semibold text-[#1E293B]">Database Management</CardTitle>
              <CardDescription className="text-base text-[#64748B] mt-2">
                Manage faculties, subjects, and room allocations
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manage Faculties Card */}
                <Card
                  className="hover:scale-102 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl shadow-sm border border-[#E2E8F0] bg-white group min-h-[200px] flex flex-col"
                  onClick={() => setCurrentView('faculties')}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-red-50 group-hover:bg-red-100 p-5 rounded-2xl transition-colors">
                        <User className="h-10 w-10 text-[#DC2626]" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-xl text-[#1E293B] mb-2">Manage Faculties</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          Add and manage faculty members and instructors
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Manage Subjects Card */}
                <Card
                  className="hover:scale-102 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl shadow-sm border border-[#E2E8F0] bg-white group min-h-[200px] flex flex-col"
                  onClick={() => setCurrentView('subjects')}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-green-50 group-hover:bg-green-100 p-5 rounded-2xl transition-colors">
                        <BookOpen className="h-10 w-10 text-[#16A34A]" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-xl text-[#1E293B] mb-2">Manage Subjects</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          Create and organize course subjects and curriculum
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Manage Allocations Card */}
                <Card
                  className="hover:scale-102 hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl shadow-sm border border-[#E2E8F0] bg-white group min-h-[200px] flex flex-col"
                  onClick={() => setCurrentView('allocations')}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-blue-50 group-hover:bg-blue-100 p-5 rounded-2xl transition-colors">
                        <Calendar className="h-10 w-10 text-[#2563EB]" />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-xl text-[#1E293B] mb-2">Manage Allocations</h3>
                        <p className="text-sm text-[#64748B] leading-relaxed">
                          Assign schedules for labs and classrooms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </SubjectsProvider>
    </FacultyProvider>
  );
}
