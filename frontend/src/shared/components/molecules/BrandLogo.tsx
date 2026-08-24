import { useNavigate } from 'react-router-dom';
import { logoCentro } from '../../../assets';

const BrandLogo = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-3 shrink-0 cursor-pointer group"
      onClick={() => navigate('/welcome')}
    >
      <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-white/20 transition-colors">
        <img src={logoCentro} alt="Logo CMEE" className="h-7 w-auto drop-shadow-sm" />
      </div>
      <span className="text-primary-foreground font-bold text-sm tracking-[0.15em] uppercase">
        SGD-CMEE
      </span>
    </div>
  );
};

export default BrandLogo;