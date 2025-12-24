'use client';

import { useState, useEffect } from 'react';
import DatabaseManagementCard from '@/components/DatabaseManagementCard';
import SlotEntryCard from '@/components/SlotEntryCardNew';
import SlotAnalyticsCard from '@/components/SlotAnalyticsCard';
import { LowAttendanceAlerts } from '@/components/LowAttendanceAlerts';

type View = 'home' | 'database' | 'slots' | 'analytics';

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [showContent, setShowContent] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [hasShownInitialAnimation, setHasShownInitialAnimation] = useState(false);

  useEffect(() => {
    // First show "Slot Observation Site" for 1 second
    const timer1 = setTimeout(() => {
      setShowWelcome(false);
      // Then show "Welcome" for 1 second
      const timer2 = setTimeout(() => {
        setShowContent(true);
        setHasShownInitialAnimation(true);
      }, 1000);
      return () => clearTimeout(timer2);
    }, 1000);

    return () => clearTimeout(timer1);
  }, []);

  const renderView = () => {
    if (currentView === 'database') {
      return <DatabaseManagementCard onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'slots') {
      return <SlotEntryCard onBack={() => setCurrentView('home')} />;
    }
    if (currentView === 'analytics') {
      return <SlotAnalyticsCard onBack={() => setCurrentView('home')} />;
    }
    return null;
  };

  if (currentView !== 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto p-4">
          {renderView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        {/* Welcome Animation */}
        {!showContent && (
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="w-full max-w-4xl text-center px-4">
              <h1 className={`text-5xl md:text-6xl font-bold text-blue-600 animate-fade-in ${showWelcome ? '' : 'animate-fade-out'}`} style={{ textAlign: 'center', display: 'block', width: '100%' }}>
                {showWelcome ? 'Slot Observation Site' : 'Welcome'}
              </h1>
            </div>
          </div>
        )}

        {showContent && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 animate-slide-in-up">
              <h1 className="text-5xl font-bold text-blue-600 mb-4">
                Welcome to Slot Observation
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Streamline your attendance tracking, manage schedules and gain insights with analytics
              </p>
            </div>

            {/* Low Attendance Alerts Section */}
            <div className="mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <LowAttendanceAlerts />
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Database Management Card */}
              <div 
                className="group cursor-pointer animate-slide-in-left"
                style={{ animationDelay: '0.3s' }}
                onClick={() => setCurrentView('database')}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-400 h-full">
                  {/* Preview Image */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-8 h-64 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm transform group-hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-blue-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-blue-100 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-4 bg-blue-200 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Manage all your data efficiently. Create, update, and organize records.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time & Attendance Tracking Card */}
              <div 
                className="group cursor-pointer animate-slide-in-right"
                style={{ animationDelay: '0.4s' }}
                onClick={() => setCurrentView('slots')}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-green-400 h-full">
                  {/* Preview Image */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 h-64 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm transform group-hover:scale-105 transition-transform duration-300">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-semibold text-gray-600">{day}</div>
                        ))}
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div key={i} className={`aspect-square rounded-lg ${i === 6 ? 'bg-green-500' : i < 6 ? 'bg-gray-200' : 'bg-white border border-gray-200'}`}></div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-700">
                        <span className="font-medium">Today</span>
                        <span className="text-green-600 font-bold">✓ Present</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Attendance Filling</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Fill attendance and manage weekly schedules without manual errors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Analytics Card */}
              <div 
                className="group cursor-pointer animate-slide-in-left md:col-start-1 md:col-end-3 flex justify-center"
                style={{ animationDelay: '0.6s' }}
                onClick={() => setCurrentView('analytics')}
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-purple-400 w-full md:w-[calc(50%-1rem)] h-full">
                  {/* Preview Image */}
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-8 h-64 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm transform group-hover:scale-105 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">Performance</div>
                        <div className="text-2xl font-bold text-gray-900">94%</div>
                      </div>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                          <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="15" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-900">94%</div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Avg Attendance</span>
                          <span className="font-semibold">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Get detailed analytics, track trends and make data-driven decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
