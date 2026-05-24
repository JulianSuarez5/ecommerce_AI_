import { Navigate } from 'react-router-dom';

export default function RegistroPage() {
  return <Navigate to="/login?tab=registro" replace />;
}
