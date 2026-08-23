import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;