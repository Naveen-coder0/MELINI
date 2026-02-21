import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/admin-login" replace />;
    }
    return <>{children}</>;
};

export default ProtectedAdminRoute;
