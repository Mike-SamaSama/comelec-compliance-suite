'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const events = [
  { id: 1, title: 'Filing of Manifestation', date: '2025-05-01', type: 'deadline', status: 'pending' },
  { id: 2, title: 'Submit Constitution', date: '2025-05-15', type: 'compliance', status: 'upcoming' },
  { id: 3, title: 'COMELEC Hearing', date: '2025-06-10', type: 'hearing', status: 'upcoming' },
  { id: 4, title: 'Publication of Manifestation', date: '2025-05-20', type: 'compliance', status: 'upcoming' },
];

export default function AdminCalendarPage() {
  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Compliance Calendar</h1>
            <p className="text-muted-foreground">Manage deadlines and hearing schedules.</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                All Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 group cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-sm">
                    {event.date.split('-')[2]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">May {event.date.split('-')[0]}</p>
                      <Badge variant="outline" className="text-[10px] h-5">{event.type}</Badge>
                    </div>
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
              {[...Array(31)].map((_, i) => {
                 const day = i + 1;
                 const event = events.find(e => parseInt(e.date.split('-')[2]) === day);
                 return (
                  <div key={day} className={`h-24 border rounded-md p-2 text-left relative hover:border-blue-400 transition-colors ${event ? 'bg-blue-50/30' : 'bg-white'}`}>
                    <span className="text-sm font-semibold text-gray-700">{day}</span>
                    {event && (
                      <div className="mt-2 text-[10px] leading-tight bg-blue-100 text-blue-700 p-1 rounded font-medium truncate">
                        {event.title}
                      </div>
                    )}
                  </div>
                 );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}