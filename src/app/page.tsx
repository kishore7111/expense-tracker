
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from '@/components/landing-page';
import UserDashboard from '@/components/dashboard/user-dashboard';
import AdminDashboard from '@/components/admin/admin-dashboard';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();
  const firestore = useFirestore();

  // Memoize the document reference
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // Fetch the user's profile to check their role
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = authLoading || profileLoading;

  // Loading state: Show skeletons while checking auth and profile
  if (isLoading) {
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

  // If user is an admin, show the admin dashboard
  if (userProfile?.role === 'admin') {
    return (
       <div className="flex flex-col min-h-screen">
        <AdminDashboard user={user} />
      </div>
    );
  }

  // Otherwise, show the standard user dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <UserDashboard user={user} />
    </div>
  );
}
