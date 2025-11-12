import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Task } from '../../types/task.types';
import { TaskActions } from './TaskActions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, Save, X } from 'lucide-react';
import { taskStore } from '../../stores/TaskStore';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = observer(({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validateField = (name: string, value: string) => {
    const trimmedValue = value.trim();
    if (name === 'title') {
      if (!trimmedValue) return 'Título es requerido';
      if (trimmedValue.length > 200) return 'Título debe tener menos de 200 caracteres';
    }
    if (name === 'description') {
      if (!trimmedValue) return 'Descripción es requerido';
      if (trimmedValue.length > 1000) return 'Descripción debe tener menos de 1000 caracteres';
    }
    return undefined;
  };

  const handleSave = async () => {
    const titleError = validateField('title', title);
    const descriptionError = validateField('description', description);
    
    setErrors({ title: titleError, description: descriptionError });
    
    if (titleError || descriptionError) return;
    
    await taskStore.updateTask(task._id, {
      title: title.trim(),
      description: description.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description);
    setErrors({});
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={taskStore.loading}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
        </CardHeader>
        <CardContent className="pb-3">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={taskStore.loading}
            className={errors.description ? 'border-destructive' : ''}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-3 border-t">
          <Button
            onClick={handleCancel}
            disabled={taskStore.loading}
            size="sm"
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={taskStore.loading}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{task.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-3 border-t">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{new Date(task.created_at).toLocaleDateString()}</span>
        </div>
        <TaskActions task={task} onEdit={() => setIsEditing(true)} />
      </CardFooter>
    </Card>
  );
});

