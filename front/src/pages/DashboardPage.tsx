import React from 'react';
import { Header } from '../components/Layout/Header';
import { Container } from '../components/Layout/Container';
import { TaskForm } from '../components/Tasks/TaskForm';
import { TaskColumns } from '../components/Tasks/TaskColumns';
import { FeedbackContainer } from '../components/Feedback/FeedbackContainer';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <Container>
        <FeedbackContainer />
        <TaskForm />
        <TaskColumns />
      </Container>
    </div>
  );
};

