import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogoutButton } from '../Auth/LogoutButton';
import { UserProfile } from '../Auth/UserProfile';
import { Separator } from '@/components/ui/separator';
import { CheckSquare } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  if (!isAuthenticated) return null;

  return (
    <header className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Todo App</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <UserProfile />
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

