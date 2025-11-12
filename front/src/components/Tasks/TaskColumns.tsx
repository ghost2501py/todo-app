import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../../stores/TaskStore';
import { TaskColumn } from './TaskColumn';

export const TaskColumns: React.FC = observer(() => {
  useEffect(() => {
    taskStore.fetchTasks();
  }, []);

  return (
    <div className="flex gap-6 flex-wrap">
      <TaskColumn
        title="Pendientes"
        tasks={taskStore.pendingTasks}
        emptyMessage="No hay tareas pendientes"
      />
      <TaskColumn
        title="Completadas"
        tasks={taskStore.completedTasks}
        emptyMessage="No hay tareas completadas"
      />
    </div>
  );
});

