import { logoCentro } from '../../../assets';
import { useConfiguracionGeneral } from '../../../shared/hooks/useConfiguracionGeneral';

const WelcomeHeader = () => {
    const { nombreInstitucion } = useConfiguracionGeneral();
    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 px-10 py-10 mb-6">
            <img 
                src={logoCentro} 
                alt="Logo CMEE" 
                className="h-32 w-32 object-contain drop-shadow-md shrink-0" 
            />
            
            <div className="flex flex-col gap-1 text-center md:text-left">
                {/* Título usando tu variable primary (#1e3a5f) */}
                <h1 className="text-3xl font-bold text-primary tracking-tight">
                    {nombreInstitucion}
                </h1>
                
                {/* Subtítulo discreto pero legible */}
                <p className="text-xs font-bold text-muted-foreground tracking-[0.15em] uppercase mt-1">
                    El Centro de Metrología contribuyendo a la cultura de calidad del país
                </p>
                
                {/* Cita con estilo blockquote moderno */}
                <div className="mt-5 pl-4 border-l-2 border-primary/30">
                    <p className="text-sm text-foreground/80 italic font-medium">
                        "Si tienes mucho, da mucho; si tienes poco, da poco; pero da siempre."
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-semibold">
                        — Biblia, Libro de Tobías
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeHeader;