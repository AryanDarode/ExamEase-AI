import { Navigate } from 'react-router-dom';
import { isLoggedIn, isProfileComplete } from '../utils/storage';

export default function ProtectedRoute({ children, requireProfile = true }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  if (requireProfile && !isProfileComplete()) {
    return <Navigate to="/profile-setup" replace />;
  }
  return children;
}
