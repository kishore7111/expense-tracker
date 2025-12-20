
'use client';

import { useState, useEffect } from 'react';
import { doc } from 'firebase/firestore';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from '@/components/landing-page';
import UserDashboard from '@/components/dashboard/user-dashboard';
import AdminDashboard from '@/components/admin/admin-dashboard';

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Loading state: Show skeletons while checking auth or loading initial data
  if (authLoading || (user && isProfileLoading)) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If not loading and no user, show the landing page
  if (!user) {
    return <LandingPage />;
  }

  // If we have a user, show the appropriate dashboard
  return (
    <div className="flex flex-col min-h-screen">
      {userProfile?.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <UserDashboard user={user} />
      )}
    </div>
  );
}
