import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user } = useAuth0();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <User className="h-4 w-4" />
      <span>{user.name || user.email}</span>
    </div>
  );
};

