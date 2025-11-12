import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Task } from '../../types/task.types';

// Mock services to avoid import.meta issues
jest.mock('../../services/api.service');
jest.mock('../../services/task.service');

const mockUpdateTask = jest.fn();

const mockTaskStore = {
  loading: false,
  updateTask: mockUpdateTask
};

jest.mock('../../stores/TaskStore', () => ({
  get taskStore() {
    return mockTaskStore;
  }
}));

jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component
}));

import { TaskItem } from '../../components/Tasks/TaskItem';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
  CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, disabled, className, ...props }: any) => (
    <input
      data-testid="edit-title-input"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  )
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, disabled, className, ...props }: any) => (
    <textarea
      data-testid="edit-description-textarea"
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      {...props}
    />
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

jest.mock('../../components/Tasks/TaskActions', () => ({
  TaskActions: ({ task, onEdit }: any) => (
    <div data-testid="task-actions">
      <button data-testid="edit-button" onClick={onEdit}>
        Edit
      </button>
      Actions for {task._id}
    </div>
  )
}));

jest.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Save: () => <span data-testid="save-icon">💾</span>,
  X: () => <span data-testid="x-icon">❌</span>
}));

describe('TaskItem', () => {
  const mockTask: Task = {
    _id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    user_id: 'user123',
    created_at: '2024-01-15T10:30:00Z',
    deleted_at: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTaskStore.loading = false;
  });

  describe('Rendering', () => {
    it('should render the task card', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render task title', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('card-title')).toHaveTextContent('Test Task');
    });

    it('should render task description', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('card-content')).toHaveTextContent('Test Description');
    });

    it('should render task actions', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('task-actions')).toBeInTheDocument();
      expect(screen.getByTestId('task-actions')).toHaveTextContent('Actions for 1');
    });

    it('should render calendar icon', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    it('should render created date', () => {
      render(<TaskItem task={mockTask} />);
      const cardFooter = screen.getByTestId('card-footer');
      // The date will be formatted based on locale
      expect(cardFooter.textContent).toContain('2024');
    });
  });

  describe('Task Variations', () => {
    it('should render pending task', () => {
      const pendingTask: Task = {
        ...mockTask,
        status: 'pending'
      };

      render(<TaskItem task={pendingTask} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render completed task', () => {
      const completedTask: Task = {
        ...mockTask,
        status: 'completed'
      };

      render(<TaskItem task={completedTask} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should render task with long title', () => {
      const longTitleTask: Task = {
        ...mockTask,
        title: 'This is a very long task title that should be displayed correctly'
      };

      render(<TaskItem task={longTitleTask} />);
      expect(screen.getByTestId('card-title')).toHaveTextContent(longTitleTask.title);
    });

    it('should render task with long description', () => {
      const longDescriptionTask: Task = {
        ...mockTask,
        description: 'This is a very long description that contains many details about the task and what needs to be done'
      };

      render(<TaskItem task={longDescriptionTask} />);
      expect(screen.getByTestId('card-content')).toHaveTextContent(longDescriptionTask.description);
    });

    it('should render task with special characters in title', () => {
      const specialCharTask: Task = {
        ...mockTask,
        title: 'Task with <special> & "characters"'
      };

      render(<TaskItem task={specialCharTask} />);
      expect(screen.getByTestId('card-title')).toHaveTextContent('Task with <special> & "characters"');
    });

    it('should render task with special characters in description', () => {
      const specialCharTask: Task = {
        ...mockTask,
        description: 'Description with <tags> and & symbols'
      };

      render(<TaskItem task={specialCharTask} />);
      expect(screen.getByTestId('card-content')).toHaveTextContent('Description with <tags> and & symbols');
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const task: Task = {
        ...mockTask,
        created_at: '2024-01-15T10:30:00Z'
      };

      render(<TaskItem task={task} />);
      const cardFooter = screen.getByTestId('card-footer');
      // Check that date is rendered (format may vary by locale)
      expect(cardFooter.textContent).toBeTruthy();
    });

    it('should handle different date formats', () => {
      const task: Task = {
        ...mockTask,
        created_at: '2023-12-25T00:00:00Z'
      };

      render(<TaskItem task={task} />);
      const cardFooter = screen.getByTestId('card-footer');
      expect(cardFooter.textContent).toContain('2023');
    });

    it('should handle recent dates', () => {
      const recentDate = new Date().toISOString();
      const task: Task = {
        ...mockTask,
        created_at: recentDate
      };

      render(<TaskItem task={task} />);
      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have card header with title', () => {
      render(<TaskItem task={mockTask} />);
      const header = screen.getByTestId('card-header');
      const title = screen.getByTestId('card-title');
      expect(header).toContainElement(title);
    });

    it('should have card content with description', () => {
      render(<TaskItem task={mockTask} />);
      const content = screen.getByTestId('card-content');
      expect(content).toHaveTextContent(mockTask.description);
    });

    it('should have card footer with date and actions', () => {
      render(<TaskItem task={mockTask} />);
      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toContainElement(screen.getByTestId('task-actions'));
    });

    it('should apply hover styles class', () => {
      render(<TaskItem task={mockTask} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:shadow-md');
    });

    it('should apply transition class', () => {
      render(<TaskItem task={mockTask} />);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('transition-shadow');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty title gracefully', () => {
      const emptyTitleTask: Task = {
        ...mockTask,
        title: ''
      };

      render(<TaskItem task={emptyTitleTask} />);
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
    });

    it('should handle empty description gracefully', () => {
      const emptyDescTask: Task = {
        ...mockTask,
        description: ''
      };

      render(<TaskItem task={emptyDescTask} />);
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
    });

    it('should handle tasks with different user ids', () => {
      const differentUserTask: Task = {
        ...mockTask,
        user_id: 'user456'
      };

      render(<TaskItem task={differentUserTask} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should handle tasks with different ids', () => {
      const differentIdTask: Task = {
        ...mockTask,
        _id: '999'
      };

      render(<TaskItem task={differentIdTask} />);
      expect(screen.getByTestId('task-actions')).toHaveTextContent('Actions for 999');
    });

    it('should render with null deleted_at', () => {
      const task: Task = {
        ...mockTask,
        deleted_at: null
      };

      render(<TaskItem task={task} />);
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should handle multiline description', () => {
      const multilineTask: Task = {
        ...mockTask,
        description: 'Line 1\nLine 2\nLine 3'
      };

      render(<TaskItem task={multilineTask} />);
      expect(screen.getByTestId('card-content')).toHaveTextContent('Line 1');
      expect(screen.getByTestId('card-content')).toHaveTextContent('Line 2');
      expect(screen.getByTestId('card-content')).toHaveTextContent('Line 3');
    });
  });

  describe('Accessibility', () => {
    it('should render semantic HTML structure', () => {
      render(<TaskItem task={mockTask} />);
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    });

    it('should have task title in heading', () => {
      render(<TaskItem task={mockTask} />);
      const title = screen.getByTestId('card-title');
      expect(title).toHaveTextContent('Test Task');
    });

    it('should display date information', () => {
      render(<TaskItem task={mockTask} />);
      const footer = screen.getByTestId('card-footer');
      expect(footer.textContent).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', () => {
      render(<TaskItem task={mockTask} />);
      const editButton = screen.getByTestId('edit-button');
      
      fireEvent.click(editButton);
      
      expect(screen.getByTestId('edit-title-input')).toBeInTheDocument();
      expect(screen.getByTestId('edit-description-textarea')).toBeInTheDocument();
    });

    it('should show input fields in edit mode', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      const descriptionTextarea = screen.getByTestId('edit-description-textarea');
      
      expect(titleInput).toBeInTheDocument();
      expect(descriptionTextarea).toBeInTheDocument();
    });

    it('should pre-populate fields with current task data', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input') as HTMLInputElement;
      const descriptionTextarea = screen.getByTestId('edit-description-textarea') as HTMLTextAreaElement;
      
      expect(titleInput.value).toBe('Test Task');
      expect(descriptionTextarea.value).toBe('Test Description');
    });

    it('should show Save and Cancel buttons in edit mode', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      expect(screen.getByText(/Guardar/i)).toBeInTheDocument();
      expect(screen.getByText(/Cancelar/i)).toBeInTheDocument();
    });

    it('should hide TaskActions in edit mode', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      expect(screen.queryByTestId('task-actions')).not.toBeInTheDocument();
    });

    it('should hide card title in edit mode', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      expect(screen.queryByTestId('card-title')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode Interactions', () => {
    it('should update title when typing in input field', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      
      expect(titleInput.value).toBe('Updated Title');
    });

    it('should update description when typing in textarea', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const descriptionTextarea = screen.getByTestId('edit-description-textarea') as HTMLTextAreaElement;
      fireEvent.change(descriptionTextarea, { target: { value: 'Updated Description' } });
      
      expect(descriptionTextarea.value).toBe('Updated Description');
    });

    it('should exit edit mode when Cancel is clicked', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('edit-title-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toBeInTheDocument();
    });

    it('should revert changes when Cancel is clicked', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
      
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
      
      fireEvent.click(screen.getByTestId('edit-button'));
      const newTitleInput = screen.getByTestId('edit-title-input') as HTMLInputElement;
      expect(newTitleInput.value).toBe('Test Task');
    });
  });

  describe('Save Functionality', () => {
    it('should call updateTask with correct data on save', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      const descriptionTextarea = screen.getByTestId('edit-description-textarea');
      
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionTextarea, { target: { value: 'Updated Description' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', {
          title: 'Updated Title',
          description: 'Updated Description'
        });
      });
    });

    it('should trim whitespace from title and description', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      const descriptionTextarea = screen.getByTestId('edit-description-textarea');
      
      fireEvent.change(titleInput, { target: { value: '  Trimmed Title  ' } });
      fireEvent.change(descriptionTextarea, { target: { value: '  Trimmed Description  ' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', {
          title: 'Trimmed Title',
          description: 'Trimmed Description'
        });
      });
    });

    it('should exit edit mode after successful save', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('edit-title-input')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('should show error if title is empty', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Título es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show error if title is only whitespace', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: '   ' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Título es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show error if title exceeds 200 characters', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const longTitle = 'a'.repeat(201);
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: longTitle } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Título debe tener menos de 200 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should show error if description is empty', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const descriptionTextarea = screen.getByTestId('edit-description-textarea');
      fireEvent.change(descriptionTextarea, { target: { value: '' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Descripción es requerido/i)).toBeInTheDocument();
      });
    });

    it('should show error if description exceeds 1000 characters', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const longDescription = 'a'.repeat(1001);
      const descriptionTextarea = screen.getByTestId('edit-description-textarea');
      fireEvent.change(descriptionTextarea, { target: { value: longDescription } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Descripción debe tener menos de 1000 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not call updateTask if validation fails', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).not.toHaveBeenCalled();
      });
    });

    it('should apply error styling to fields with validation errors', async () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(titleInput).toHaveClass('border-destructive');
      });
    });

    it('should clear errors when canceling', () => {
      render(<TaskItem task={mockTask} />);
      fireEvent.click(screen.getByTestId('edit-button'));
      
      const titleInput = screen.getByTestId('edit-title-input');
      fireEvent.change(titleInput, { target: { value: '' } });
      
      const saveButton = screen.getByText(/Guardar/i);
      fireEvent.click(saveButton);
      
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
      
      fireEvent.click(screen.getByTestId('edit-button'));
      expect(screen.queryByText(/Título es requerido/i)).not.toBeInTheDocument();
    });
  });
});

