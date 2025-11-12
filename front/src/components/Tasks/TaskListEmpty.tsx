import React from 'react';
import { FileX } from 'lucide-react';

export const TaskListEmpty: React.FC = () => {
  return (
    <div className="text-center py-16 px-6">
      <FileX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Todavía no hay tareas. ¡Crea tu primera tarea!</p>
    </div>
  );
};

