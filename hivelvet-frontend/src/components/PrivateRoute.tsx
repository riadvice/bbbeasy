import { Component } from 'react';
import { Navigate, Route, RouteProps, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';

const PrivateRoute = ({ children }) => {
    const { state } = useLocation();

    const user = authService.getCurrentUser();
    if (state) {
        return children;
    } else {
        if (user != null) {
            return children;
        } else {
            return <Navigate to="/login" />;
        }
    }
};

export default PrivateRoute;
