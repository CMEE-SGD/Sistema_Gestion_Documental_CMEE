export interface FormPersonaProps {
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setFotoFile: React.Dispatch<React.SetStateAction<File | null>>;
    documentosFiles: File[];
    setDocumentosFiles: React.Dispatch<React.SetStateAction<File[]>>;
    rolesLista: any[];
    departamentos: any[];
    puestosLista: any[];
    onSubmit: (e: React.FormEvent) => void;
    isEdit?: boolean;
}