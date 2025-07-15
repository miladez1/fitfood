import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.tsx';

export const AuthGuard: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user } = useContext(AppContext);
    const location = useLocation();

    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they
        // log in, which is a nicer user experience than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};