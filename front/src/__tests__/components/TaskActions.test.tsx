import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Task } from '../../types/task.types';

const mockUpdateTask = jest.fn();
const mockDeleteTask = jest.fn();

const mockTaskStore = {
  loading: false,
  updateTask: mockUpdateTask,
  deleteTask: mockDeleteTask
};

jest.mock('../../stores/TaskStore', () => ({
  get taskStore() {
    return mockTaskStore;
  }
}));

jest.mock('mobx-react-lite', () => ({
  observer: (component: any) => component
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

jest.mock('lucide-react', () => ({
  Check: () => <span data-testid="check-icon">✓</span>,
  RotateCcw: () => <span data-testid="rotate-icon">↻</span>,
  Trash2: () => <span data-testid="trash-icon">🗑</span>,
  Pencil: () => <span data-testid="pencil-icon">✎</span>
}));

const mockConfirm = jest.fn();
global.confirm = mockConfirm;

import { TaskActions } from '../../components/Tasks/TaskActions';

describe('TaskActions', () => {
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
    it('should render Edit button', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByText(/Editar/i)).toBeInTheDocument();
    });

    it('should render Complete button for pending tasks', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByText(/Completado/i)).toBeInTheDocument();
    });

    it('should render Reopen button for completed tasks', () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      render(<TaskActions task={completedTask} />);
      expect(screen.getByText(/Reabrir/i)).toBeInTheDocument();
    });

    it('should render Delete button', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByText(/Borrar/i)).toBeInTheDocument();
    });

    it('should render all three buttons', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByText(/Editar/i)).toBeInTheDocument();
      expect(screen.getByText(/Completado/i)).toBeInTheDocument();
      expect(screen.getByText(/Borrar/i)).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render Pencil icon for Edit button', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByTestId('pencil-icon')).toBeInTheDocument();
    });

    it('should render Check icon for pending tasks', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should render Rotate icon for completed tasks', () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      render(<TaskActions task={completedTask} />);
      expect(screen.getByTestId('rotate-icon')).toBeInTheDocument();
    });

    it('should render Trash icon for Delete button', () => {
      render(<TaskActions task={mockTask} />);
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });
  });

  describe('Edit Button', () => {
    it('should call onEdit when Edit button is clicked', () => {
      const mockOnEdit = jest.fn();
      render(<TaskActions task={mockTask} onEdit={mockOnEdit} />);
      
      const editButton = screen.getByText(/Editar/i);
      fireEvent.click(editButton);
      
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should handle missing onEdit prop gracefully', () => {
      render(<TaskActions task={mockTask} />);
      
      const editButton = screen.getByText(/Editar/i);
      expect(() => fireEvent.click(editButton)).not.toThrow();
    });
  });

  describe('Toggle Status Button', () => {
    it('should call updateTask with completed status for pending tasks', async () => {
      render(<TaskActions task={mockTask} />);
      
      const completeButton = screen.getByText(/Completado/i);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'completed' });
      });
    });

    it('should call updateTask with pending status for completed tasks', async () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      render(<TaskActions task={completedTask} />);
      
      const reopenButton = screen.getByText(/Reabrir/i);
      fireEvent.click(reopenButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'pending' });
      });
    });

    it('should toggle status correctly', async () => {
      const { rerender } = render(<TaskActions task={mockTask} />);
      
      const completeButton = screen.getByText(/Completado/i);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'completed' });
      });
      
      const completedTask: Task = { ...mockTask, status: 'completed' };
      rerender(<TaskActions task={completedTask} />);
      
      const reopenButton = screen.getByText(/Reabrir/i);
      fireEvent.click(reopenButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'pending' });
      });
    });
  });

  describe('Delete Button', () => {
    it('should show confirmation dialog when Delete is clicked', () => {
      mockConfirm.mockReturnValue(false);
      render(<TaskActions task={mockTask} />);
      
      const deleteButton = screen.getByText(/Borrar/i);
      fireEvent.click(deleteButton);
      
      expect(mockConfirm).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar esta tarea?');
    });

    it('should call deleteTask when confirmed', async () => {
      mockConfirm.mockReturnValue(true);
      render(<TaskActions task={mockTask} />);
      
      const deleteButton = screen.getByText(/Borrar/i);
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith('1');
      });
    });

    it('should not call deleteTask when cancelled', () => {
      mockConfirm.mockReturnValue(false);
      render(<TaskActions task={mockTask} />);
      
      const deleteButton = screen.getByText(/Borrar/i);
      fireEvent.click(deleteButton);
      
      expect(mockDeleteTask).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable all buttons when loading', () => {
      mockTaskStore.loading = true;
      
      render(<TaskActions task={mockTask} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Task Variations', () => {
    it('should work with different task IDs', async () => {
      const differentTask: Task = { ...mockTask, _id: '999' };
      mockConfirm.mockReturnValue(true);
      
      render(<TaskActions task={differentTask} />);
      
      const deleteButton = screen.getByText(/Borrar/i);
      fireEvent.click(deleteButton);
      
      await waitFor(() => {
        expect(mockDeleteTask).toHaveBeenCalledWith('999');
      });
    });

    it('should handle tasks with completed status', () => {
      const completedTask: Task = { ...mockTask, status: 'completed' };
      render(<TaskActions task={completedTask} />);
      
      expect(screen.getByText(/Reabrir/i)).toBeInTheDocument();
      expect(screen.queryByText(/Completado/i)).not.toBeInTheDocument();
    });

    it('should handle tasks with pending status', () => {
      const pendingTask: Task = { ...mockTask, status: 'pending' };
      render(<TaskActions task={pendingTask} />);
      
      expect(screen.getByText(/Completado/i)).toBeInTheDocument();
      expect(screen.queryByText(/Reabrir/i)).not.toBeInTheDocument();
    });
  });

  describe('Multiple Actions', () => {
    it('should allow edit and status toggle independently', async () => {
      const mockOnEdit = jest.fn();
      render(<TaskActions task={mockTask} onEdit={mockOnEdit} />);
      
      const editButton = screen.getByText(/Editar/i);
      fireEvent.click(editButton);
      expect(mockOnEdit).toHaveBeenCalled();
      
      const completeButton = screen.getByText(/Completado/i);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith('1', { status: 'completed' });
      });
    });

    it('should handle multiple button clicks', async () => {
      render(<TaskActions task={mockTask} />);
      
      const completeButton = screen.getByText(/Completado/i);
      fireEvent.click(completeButton);
      fireEvent.click(completeButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Component Structure', () => {
    it('should render buttons in correct order', () => {
      render(<TaskActions task={mockTask} />);
      const buttons = screen.getAllByRole('button');
      
      expect(buttons[0]).toHaveTextContent(/Editar/i);
      expect(buttons[1]).toHaveTextContent(/Completado|Reabrir/i);
      expect(buttons[2]).toHaveTextContent(/Borrar/i);
    });

    it('should render buttons in a container', () => {
      const { container } = render(<TaskActions task={mockTask} />);
      const divs = container.querySelectorAll('div');
      
      expect(divs.length).toBeGreaterThan(0);
    });
  });
});

