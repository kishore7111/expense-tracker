
'use client';

import { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import Header from '@/components/dashboard/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserExpenses from './user-expenses';

type AdminDashboardProps = {
  user: FirebaseUser;
};

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const firestore = useFirestore();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const usersQuery = useMemoFirebase(() => {
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);

  if (usersLoading) {
    return (
      <>
        <Header user={user} onGenerateSummary={() => {}} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Skeleton className="h-96" />
        </main>
      </>
    );
  }

  if (selectedUser) {
    return <UserExpenses adminUser={user} selectedUser={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  return (
    <>
      <Header user={user} onGenerateSummary={() => {}} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Admin Dashboard: All Users
            </CardTitle>
            <CardDescription>View and manage all users in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.email}</TableCell>
                      <TableCell>{u.role || 'user'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedUser(u)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Expenses
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
