import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the services and stores before importing components
jest.mock('../../services/task.service');
jest.mock('../../services/api.service');
jest.mock('../../stores/TaskStore', () => ({
  taskStore: {
    loading: false,
    createTask: jest.fn()
  }
}));

import { TaskForm } from '../../components/Tasks/TaskForm';
import { taskStore } from '../../stores/TaskStore';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  )
}));

jest.mock('../../components/Tasks/TaskFormValidation', () => ({
  TaskFormValidation: ({ error }: any) => 
    error ? <div data-testid="validation-error">{error}</div> : null
}));

jest.mock('lucide-react', () => ({
  Plus: () => <span>+</span>
}));

describe('TaskForm', () => {
  const mockCreateTask = jest.fn();

  beforeEach(() => {
    (taskStore.createTask as jest.Mock) = mockCreateTask;
    (taskStore as any).loading = false;
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the form', () => {
      render(<TaskForm />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render title input', () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      expect(inputs[0]).toHaveAttribute('placeholder', 'Título');
    });

    it('should render description textarea', () => {
      render(<TaskForm />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('placeholder', 'Descripción');
    });

    it('should render submit button', () => {
      render(<TaskForm />);
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Crear Tarea');
    });

    it('should render card title', () => {
      render(<TaskForm />);
      expect(screen.getByTestId('card-title')).toHaveTextContent('Crear Nueva Tarea');
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is empty', () => {
      render(<TaskForm />);
      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('should validate title on blur', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent('Título es requerido');
      });
    });

    it('should validate description on blur', async () => {
      render(<TaskForm />);
      const textarea = screen.getByTestId('textarea');

      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent('Descripción es requerido');
      });
    });

    it('should validate title length', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      const longTitle = 'a'.repeat(201);
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent(
          'Title debe tener menos de 200 caracteres'
        );
      });
    });

    it('should validate description length', async () => {
      render(<TaskForm />);
      const textarea = screen.getByTestId('textarea');

      const longDescription = 'a'.repeat(1001);
      fireEvent.change(textarea, { target: { value: longDescription } });
      fireEvent.blur(textarea);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent(
          'Descripción debe tener menos de 1000 characters'
        );
      });
    });

    it('should validate trimmed empty strings', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toHaveTextContent('Título es requerido');
      });
    });

    it('should clear validation errors when valid input is provided', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      fireEvent.blur(titleInput);
      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      });

      fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

      await waitFor(() => {
        expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
      });
    });

    it('should enable submit button when form is valid', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
      fireEvent.change(textarea, { target: { value: 'Valid Description' } });

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(textarea, { target: { value: 'Test Description' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description'
        });
      });
    });

    it('should trim whitespace from inputs before submission', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
      fireEvent.change(textarea, { target: { value: '  Test Description  ' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description'
        });
      });
    });

    it('should clear form after successful submission', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(titleInput, { target: { value: 'Test Task' } });
      fireEvent.change(textarea, { target: { value: 'Test Description' } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(textarea).toHaveValue('');
      });
    });

    it('should not submit form with invalid data', async () => {
      render(<TaskForm />);

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).not.toHaveBeenCalled();
      });
    });

    it('should prevent submission with only whitespace', async () => {
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByTestId('button');

      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.change(textarea, { target: { value: '   ' } });

      expect(button).toBeDisabled();
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it('should show validation errors on invalid submission', async () => {
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');

      // Fill with invalid data (too long)
      const longTitle = 'a'.repeat(201);
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.change(textarea, { target: { value: 'Valid Description' } });
      fireEvent.blur(titleInput);
      fireEvent.blur(textarea);

      await waitFor(() => {
        const error = screen.getByTestId('validation-error');
        expect(error).toHaveTextContent('Title debe tener menos de 200 caracteres');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      (taskStore as any).loading = true;
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const textarea = screen.getByTestId('textarea');

      expect(inputs[0]).toBeDisabled();
      expect(textarea).toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      (taskStore as any).loading = true;
      render(<TaskForm />);

      const button = screen.getByTestId('button');
      expect(button).toBeDisabled();
    });

    it('should show loading text on button', () => {
      (taskStore as any).loading = true;
      render(<TaskForm />);

      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Creando...');
    });
  });

  describe('User Interaction', () => {
    it('should update title value on change', () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      fireEvent.change(titleInput, { target: { value: 'New Title' } });

      expect(titleInput).toHaveValue('New Title');
    });

    it('should update description value on change', () => {
      render(<TaskForm />);
      const textarea = screen.getByTestId('textarea');

      fireEvent.change(textarea, { target: { value: 'New Description' } });

      expect(textarea).toHaveValue('New Description');
    });

    it('should validate on change after field is touched', async () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      // Touch the field first
      fireEvent.blur(titleInput);

      // Then change to invalid value
      fireEvent.change(titleInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByTestId('validation-error')).toBeInTheDocument();
      });
    });

    it('should not validate on change before field is touched', () => {
      render(<TaskForm />);
      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];

      // Change without blur
      fireEvent.change(titleInput, { target: { value: '' } });

      expect(screen.queryByTestId('validation-error')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long valid titles', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');

      const longTitle = 'a'.repeat(200);
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.change(textarea, { target: { value: 'Description' } });

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalled();
      });
    });

    it('should handle very long valid descriptions', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');

      const longDescription = 'a'.repeat(1000);
      fireEvent.change(titleInput, { target: { value: 'Title' } });
      fireEvent.change(textarea, { target: { value: longDescription } });

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalled();
      });
    });

    it('should handle special characters in input', async () => {
      mockCreateTask.mockResolvedValue(undefined);
      render(<TaskForm />);

      const inputs = screen.getAllByTestId('input');
      const titleInput = inputs[0];
      const textarea = screen.getByTestId('textarea');

      fireEvent.change(titleInput, { target: { value: '<script>alert("xss")</script>' } });
      fireEvent.change(textarea, { target: { value: 'Description with "quotes" and \'apostrophes\'' } });

      const button = screen.getByTestId('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockCreateTask).toHaveBeenCalledWith({
          title: '<script>alert("xss")</script>',
          description: 'Description with "quotes" and \'apostrophes\''
        });
      });
    });
  });
});

