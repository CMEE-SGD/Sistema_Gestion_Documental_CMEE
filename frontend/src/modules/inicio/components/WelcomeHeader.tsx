import { logoCentro } from '../../../assets';

const WelcomeHeader = () => {
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm flex items-center gap-6 px-8 py-8 mb-4">
      <div className="shrink-0 border border-gray-300 rounded p-1 bg-white">
        <img src={logoCentro} alt="Logo CMEE" className="h-36 w-36 object-contain" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-gray-800">
          Centro de Metrologia del Ejercito Ecuatoriano
        </h1>
        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">
          EL CENTRO DE METROLOGIA CONTRIBUYENDO A LA CULTURA DE CALIDAD DEL PAIS
        </p>
        <p className="text-sm text-gray-500 mt-1">
          "Si tienes mucho, da mucho; si tienes poco, da poco; pero da siempre."
        </p>
        <p className="text-sm italic text-gray-400">
          Biblia, Libro de Tobias
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;