import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage'; // Asegúrate de que este camino sea correcto
import WelcomePage from '../pages/Index'; // Asegúrate de que este camino sea correcto

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
