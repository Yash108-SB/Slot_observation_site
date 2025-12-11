'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, X, AlertCircle, Calendar, User, BookOpen, Users } from 'lucide-react';

interface Alert {
  subjectName: string;
  facultyName: string;
  classType: 'LAB' | 'LECTURE';
  batchName: string | null;
  divisionName: string | null;
  capacity: number;
  averageAttendancePercentage: number;
  threshold: number;
  totalClasses: number;
  totalPresent: number;
  totalPossible: number;
  totalTimeSlots: number;
  alertSeverity: 'critical' | 'warning';
  records: Array<{
    date: string;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
    attendancePercentage: number;
    remarks: string;
    slotDetails: {
      startTime: string;
      endTime: string;
      dayOfWeek: string;
    } | null;
  }>;
}

interface AlertsResponse {
  summary: {
    totalAlertsCount: number;
    criticalCount: number;
    warningCount: number;
    labAlertsCount: number;
    lectureAlertsCount: number;
    dateRange: { from: string; to: string } | null;
  };
  alerts: Alert[];
}

export function LowAttendanceAlerts() {
  const [alertsData, setAlertsData] = useState<AlertsResponse | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      // Fetch alerts from ALL TIME (no date filter = till date)
      const response = await fetch(
        `http://localhost:3001/analytics/alerts/low-attendance`
      );
      const data = await response.json();
      setAlertsData(data);
      setLastFetched(new Date());
    } catch (error) {
      console.error('Failed to fetch low attendance alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const openAlertDetails = (alert: Alert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  if (isLoading && !alertsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Low Attendance Alerts
          </CardTitle>
          <CardDescription>Loading alerts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!alertsData || !alertsData.summary || alertsData.summary.totalAlertsCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Low Attendance Alerts
          </CardTitle>
          <CardDescription>
            All subjects meeting attendance thresholds! 🎉
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-orange-200 bg-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Low Attendance Alerts
          </CardTitle>
          <CardDescription>
            {alertsData.summary.totalAlertsCount} subjects below threshold
            {alertsData.summary.criticalCount > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                ({alertsData.summary.criticalCount} critical)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">Critical</div>
                <div className="text-2xl font-bold text-red-600">
                  {alertsData.summary.criticalCount}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">Warnings</div>
                <div className="text-2xl font-bold text-orange-600">
                  {alertsData.summary.warningCount}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">Labs</div>
                <div className="text-2xl font-bold text-blue-600">
                  {alertsData.summary.labAlertsCount}
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-xs text-gray-500">Lectures</div>
                <div className="text-2xl font-bold text-purple-600">
                  {alertsData.summary.lectureAlertsCount}
                </div>
              </div>
            </div>

            {/* Alert List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {alertsData.alerts.map((alert, index) => (
                <div
                  key={`${alert.subjectName}-${alert.facultyName}-${alert.classType}-${index}`}
                  onClick={() => openAlertDetails(alert)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    alert.alertSeverity === 'critical'
                      ? 'bg-red-50 border-red-300 hover:border-red-400'
                      : 'bg-orange-50 border-orange-300 hover:border-orange-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {alert.alertSeverity === 'critical' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                        )}
                        <h4 className="font-semibold text-gray-900">
                          {alert.subjectName}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            alert.classType === 'LAB'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {alert.classType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{alert.facultyName}</span>
                        </div>
                        {alert.batchName && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Batch: {alert.batchName}</span>
                          </div>
                        )}
                        {alert.divisionName && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>Division: {alert.divisionName}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Combined from {alert.totalTimeSlots} time slot{alert.totalTimeSlots > 1 ? 's' : ''}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3">
                        <div>
                          <span className="text-xs text-gray-500">Overall Attendance: </span>
                          <span
                            className={`font-bold ${
                              alert.alertSeverity === 'critical'
                                ? 'text-red-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {alert.averageAttendancePercentage.toFixed(1)}%
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            (Threshold: {alert.threshold}%)
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.totalClasses} classes tracked
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 text-center mt-2">
              Last updated: {lastFetched?.toLocaleTimeString()} • Auto-refreshes every 5
              minutes
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert?.alertSeverity === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              {selectedAlert?.subjectName} - Attendance Details
            </DialogTitle>
            <DialogDescription>
              {selectedAlert?.facultyName} • {selectedAlert?.classType}
              {selectedAlert?.batchName && ` • Batch: ${selectedAlert.batchName}`}
              {selectedAlert?.divisionName && ` • Division: ${selectedAlert.divisionName}`}
              {selectedAlert?.totalTimeSlots && selectedAlert.totalTimeSlots > 1 && (
                <span className="block text-xs mt-1 text-gray-500">
                  Combined data from {selectedAlert.totalTimeSlots} different time slots
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Overall Average</div>
                  <div
                    className={`text-xl font-bold ${
                      selectedAlert.alertSeverity === 'critical'
                        ? 'text-red-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {selectedAlert.averageAttendancePercentage.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Capacity</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedAlert.capacity}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Total Classes</div>
                  <div className="text-xl font-bold text-gray-900">
                    {selectedAlert.totalClasses}
                  </div>
                </div>
              </div>

              {/* Class Records */}
              <div>
                <h4 className="font-semibold mb-2">Attendance History (All Time Slots)</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedAlert.records.map((record, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          {record.slotDetails && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {record.slotDetails.dayOfWeek} {record.slotDetails.startTime}-{record.slotDetails.endTime}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Present: {record.presentCount} / Absent: {record.absentCount}
                          </div>
                          {record.remarks && (
                            <div className="text-xs text-gray-600 mt-1 italic">
                              "{record.remarks}"
                            </div>
                          )}
                        </div>
                        <div
                          className={`text-lg font-bold ml-2 ${
                            record.attendancePercentage < selectedAlert.threshold - 10
                              ? 'text-red-600'
                              : record.attendancePercentage < selectedAlert.threshold
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {record.attendancePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
