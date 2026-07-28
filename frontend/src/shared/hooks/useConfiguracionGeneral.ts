import { useEffect, useState } from 'react';
import api from '../../core/api/axios';

export const NOMBRE_INSTITUCION_DEFECTO =
  'Centro de Metrología del Ejército Ecuatoriano';

interface ConfiguracionGeneral {
  nombre_institucion: string;
  max_intentos_fallidos_login: number;
}

/** Configuración institucional editable — pública, no requiere sesión (la usa la pantalla de login). */
export const useConfiguracionGeneral = () => {
  const [config, setConfig] = useState<ConfiguracionGeneral | null>(null);

  useEffect(() => {
    api.get('/configuracion-general')
      .then((res) => setConfig(res.data))
      .catch(() => {});
  }, []);

  return {
    nombreInstitucion: config?.nombre_institucion ?? NOMBRE_INSTITUCION_DEFECTO,
    maxIntentosFallidosLogin: config?.max_intentos_fallidos_login ?? null,
    config,
  };
};
