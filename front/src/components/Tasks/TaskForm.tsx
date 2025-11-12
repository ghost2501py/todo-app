import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../../stores/TaskStore';
import { TaskFormValidation } from './TaskFormValidation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const TaskForm: React.FC = observer(() => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});

  const validateField = (name: string, value: string) => {
    const trimmedValue = value.trim();

    if (name === 'title') {
      if (!trimmedValue) {
        return 'Título es requerido';
      }
      if (trimmedValue.length > 200) {
        return 'Title debe tener menos de 200 caracteres';
      }
    }

    if (name === 'description') {
      if (!trimmedValue) {
        return 'Descripción es requerido';
      }
      if (trimmedValue.length > 1000) {
        return 'Descripción debe tener menos de 1000 characters';
      }
    }

    return undefined;
  };

  const handleBlur = (field: 'title' | 'description') => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, field === 'title' ? title : description);
    setErrors({ ...errors, [field]: error });
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (touched.title) {
      const error = validateField('title', value);
      setErrors({ ...errors, title: error });
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (touched.description) {
      const error = validateField('description', value);
      setErrors({ ...errors, description: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleError = validateField('title', title);
    const descriptionError = validateField('description', description);

    setErrors({
      title: titleError,
      description: descriptionError
    });

    setTouched({
      title: true,
      description: true
    });

    if (titleError || descriptionError) {
      return;
    }

    await taskStore.createTask({ title: title.trim(), description: description.trim() });
    setTitle('');
    setDescription('');
    setErrors({});
    setTouched({});
  };

  const isFormValid = !validateField('title', title) && !validateField('description', description);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Crear Nueva Tarea</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={() => handleBlur('title')}
              disabled={taskStore.loading}
              className={touched.title && errors.title ? 'border-destructive' : ''}
            />
            <TaskFormValidation error={touched.title ? errors.title : undefined} />
          </div>
          <div>
            <Textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={() => handleBlur('description')}
              disabled={taskStore.loading}
              className={touched.description && errors.description ? 'border-destructive' : ''}
            />
            <TaskFormValidation error={touched.description ? errors.description : undefined} />
          </div>
          <Button
            type="submit"
            disabled={taskStore.loading || !isFormValid || !title.trim() || !description.trim()}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {taskStore.loading ? 'Creando...' : 'Crear Tarea'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
});

