import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.tsx';

export const AdminGuard: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { isAdmin } = useContext(AppContext);
    const location = useLocation();

    if (!isAdmin) {
        // Redirect them to the /login page if they are not an admin
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};