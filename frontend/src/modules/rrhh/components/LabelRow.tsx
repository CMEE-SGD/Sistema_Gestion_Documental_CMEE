import InfoIcon from './InfoIcon';

interface LabelRowProps {
    label: string;
    requerido?: boolean;
    children: React.ReactNode;
    mb?: string;
}

const LabelRow = ({ label, requerido = false, children, mb = "mb-3" }: LabelRowProps) => (
    <div className={`flex items-start ${mb}`}>
        <div className="w-40 flex items-center gap-1.5 text-[11px] text-gray-800 shrink-0 pt-1">
            <InfoIcon />
            <span>{label} {requerido && <span>*</span>}</span>
        </div>
        <div className="flex-1">
            {children}
        </div>
    </div>
);

export default LabelRow;