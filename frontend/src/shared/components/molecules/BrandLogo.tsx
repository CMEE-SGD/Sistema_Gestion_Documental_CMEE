import { useNavigate } from 'react-router-dom';
import { logoCentro } from '../../../assets';

const BrandLogo = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-2 shrink-0 mr-2 cursor-pointer"
      onClick={() => navigate('/welcome')}
    >
      <img src={logoCentro} alt="Logo CMEE" className="h-12 w-auto" />
      <span className="text-white font-black text-sm tracking-widest uppercase">
        SGD-CMEE
      </span>
    </div>
  );
};

export default BrandLogo;