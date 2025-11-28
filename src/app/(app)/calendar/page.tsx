'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

const events = [
  { id: 1, title: 'Filing of Manifestation', date: '2025-05-01', type: 'deadline', status: 'pending' },
  { id: 2, title: 'Submit Constitution', date: '2025-05-15', type: 'compliance', status: 'upcoming' },
  { id: 3, title: 'COMELEC Hearing', date: '2025-06-10', type: 'hearing', status: 'upcoming' },
  { id: 4, title: 'Publication of Manifestation', date: '2025-05-20', type: 'compliance', status: 'upcoming' },
];

export default function CalendarPage() {
  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Compliance Calendar</h1>
          <p className="text-muted-foreground">Track critical deadlines and hearing schedules.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline">Today</Button>
          <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Upcoming List */}
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-sm">
                    {event.date.split('-')[2]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">May {event.date.split('-')[0]}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{event.type}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Calendar Grid */}
        <Card className="md:col-span-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4 text-center text-sm font-medium text-gray-500 mb-4">
              <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(31)].map((_, i) => (
                <div key={i} className="h-24 border rounded-md p-2 text-left hover:border-blue-400 transition-colors bg-white">
                  <span className="text-sm font-semibold text-gray-700">{i + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}