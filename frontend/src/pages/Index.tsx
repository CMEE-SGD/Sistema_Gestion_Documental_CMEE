import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const WelcomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/'); // Regresar al login
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar en la parte superior */}
      <Navbar />

      {/* Contenido de la pagina */}
      <div className="flex flex-1 justify-center items-center">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Bienvenido!</h1>
          <p className="text-gray-600 mb-6">Has iniciado sesion correctamente.</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded">
            Cerrar Sesion
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
