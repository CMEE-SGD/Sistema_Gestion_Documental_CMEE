import { useNavigate } from 'react-router-dom';
import { currentUser } from '../data/users';

export const useAuth = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/');
  };

  return { user: currentUser, cerrarSesion };
};
