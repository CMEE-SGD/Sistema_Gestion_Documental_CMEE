import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  path: string;
}

const StatCard = ({ title, value, icon: Icon, iconColor, path }: StatCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
    >
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
      </div>
      <Icon className={`w-8 h-8 ${iconColor}`} />
    </div>
  );
};

export default StatCard;