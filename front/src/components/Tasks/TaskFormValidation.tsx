import React from 'react';

interface TaskFormValidationProps {
  error?: string;
}

export const TaskFormValidation: React.FC<TaskFormValidationProps> = ({ error }) => {
  if (!error) return null;

  return (
    <p className="text-sm text-destructive mt-1">
      {error}
    </p>
  );
};


