'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, ArrowLeft } from 'lucide-react';

interface SlotAnalyticsCardProps {
  onBack?: () => void;
}

export default function SlotAnalyticsCard({ onBack }: SlotAnalyticsCardProps = {}) {
  return (
    <div className="space-y-4">
      {/* Back Button */}
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      )}
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Slot Analytics</CardTitle>
          </div>
          <CardDescription>View statistics and analytics for slot data</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Analytics content will be displayed here */}
        </CardContent>
      </Card>
    </div>
  );
}
