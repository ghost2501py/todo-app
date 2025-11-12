import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { taskStore } from '../../stores/TaskStore';
import { Loading } from '../Common/Loading';
import { ToastContainer } from '../Common/ToastContainer';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export const FeedbackContainer: React.FC = observer(() => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    if (taskStore.error) {
      const id = Date.now().toString();
      setToasts(prev => {
        const newToasts = [{ id, message: taskStore.error!, type: 'error' }, ...prev];
        return newToasts.slice(0, 5);
      });
    }
  }, [taskStore.error, taskStore.messageId]);

  useEffect(() => {
    if (taskStore.success) {
      const id = Date.now().toString();
      setToasts(prev => {
        const newToasts = [{ id, message: taskStore.success!, type: 'success' }, ...prev];
        return newToasts.slice(0, 5);
      });
    }
  }, [taskStore.success, taskStore.messageId]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {taskStore.loading && <Loading />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
});

