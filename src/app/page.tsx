
'use client';

import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import LandingPage from '@/components/landing-page';
import UserDashboard from '@/components/dashboard/user-dashboard';

export default function DashboardPage() {
  const { user, isUserLoading: authLoading } = useUser();

  // Loading state: Show skeletons while checking auth
  if (authLoading) {
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

  // If we have a user, show the standard user dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <UserDashboard user={user} />
    </div>
  );
}
