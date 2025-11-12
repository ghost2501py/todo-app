import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../../stores/TaskStore';
import { TaskItem } from './TaskItem';
import { TaskListEmpty } from './TaskListEmpty';

export const TaskList: React.FC = observer(() => {
  useEffect(() => {
    taskStore.fetchTasks();
  }, []);

  if (taskStore.tasks.length === 0) {
    return <TaskListEmpty />;
  }

  return (
    <div>
      <h2>Tus Tareas</h2>
      {taskStore.tasks.map((task) => (
        <TaskItem key={task._id} task={task} />
      ))}
    </div>
  );
});

