import React from 'react';
import { Task } from '../../types/task.types';
import { TaskItem } from './TaskItem';
import { Separator } from '@/components/ui/separator';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  emptyMessage: string;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ title, tasks, emptyMessage }) => {
  return (
    <div className="flex-1 min-w-[300px] p-3">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <Separator className="mb-4" />
      {tasks.length === 0 ? (
        <div className="text-center py-10 px-4 text-muted-foreground italic">
          {emptyMessage}
        </div>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskItem key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

