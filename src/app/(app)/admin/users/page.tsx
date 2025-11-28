'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const initialUsers = [
  { id: 1, name: 'Juan Dela Cruz', email: 'juan@bayanmuna.ph', party: 'Bayan Muna', role: 'member', status: 'active', date: '2023-10-01' },
  { id: 2, name: 'Maria Santos', email: 'maria@gabriela.ph', party: 'Gabriela', role: 'admin', status: 'active', date: '2023-09-15' },
  { id: 3, name: 'Pedro Penduko', email: 'pedro@magdalo.org', party: 'Magdalo', role: 'member', status: 'pending', date: '2023-11-25' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.status === filter;
  });

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Access Control</h1>
          <p className="text-muted-foreground">Manage user roles and approvals.</p>
        </div>
      </div>

      {/* Filter Controls - Standard Buttons */}
      <div className="flex justify-between items-center gap-4">
         <div className="flex gap-2">
           <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
           <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending</Button>
         </div>
         {/* Simplified Input */}
         <input 
            className="flex h-10 w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Search users..." 
         />
      </div>

      {/* Simplified Table Container */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="p-6 pb-0 mb-4 border-b">
            <h3 className="font-semibold text-lg">Users</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-gray-500">Name</th>
                <th className="p-4 font-medium text-gray-500">Role</th>
                <th className="p-4 font-medium text-gray-500">Status</th>
                <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="p-4 capitalize">{user.role}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}