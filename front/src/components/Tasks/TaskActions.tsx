import React from 'react';
import { observer } from 'mobx-react-lite';
import { Task } from '../../types/task.types';
import { taskStore } from '../../stores/TaskStore';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  task: Task;
}

export const TaskActions: React.FC<TaskActionsProps> = observer(({ task }) => {
  const handleToggleStatus = async () => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    await taskStore.updateTask(task._id, { status: newStatus });
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      await taskStore.deleteTask(task._id);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleToggleStatus}
        disabled={taskStore.loading}
        size="sm"
        variant="outline"
      >
        {task.status === 'pending' ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Completado
          </>
        ) : (
          <>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reabrir
          </>
        )}
      </Button>
      <Button
        onClick={handleDelete}
        disabled={taskStore.loading}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Borrar
      </Button>
    </div>
  );
});

