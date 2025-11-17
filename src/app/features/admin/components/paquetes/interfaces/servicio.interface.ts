import { FrecuenciaTipo } from '../../../../../shared/enums/frecuencia-tipo.enum';

export interface IServicio {
  id: number;
  nombre: string;
  valor: number;
  paquetes?: IPaquete[];
}

interface IPaquete {
  id: number;
  nombre: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export interface ICrearPaqueteRequest {
  nombre: string;
  valor: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  activo?: boolean;
  frecuencia_tipo: FrecuenciaTipo;
  frecuencia_valor?: number | null;
  servicios: {
    nombre_servicio: string;
    valor_servicio: number;
  }[];
}
