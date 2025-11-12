import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export const LogoutButton: React.FC = () => {
  const { logout } = useAuth0();

  return (
    <Button
      variant="outline"
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Cerrar sesión
    </Button>
  );
};

