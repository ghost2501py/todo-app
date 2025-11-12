import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginButton } from '../components/Auth/LoginButton';
import { Container } from '../components/Layout/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <Container>
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckSquare className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Bienvenido a Todo App</CardTitle>
            <CardDescription className="text-base">
              Organiza tus tareas de forma eficiente y mantén la productividad.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Inicia sesión o regístrate para manejar tus tareas
              </p>
            </div>
            <LoginButton />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

