import React from 'react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  // For demo purposes, allow access to all routes without authentication
  // In production, implement proper authentication checks
  return children;
};

export default ProtectedRoute;