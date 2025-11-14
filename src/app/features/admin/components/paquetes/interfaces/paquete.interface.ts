export interface Paquete {
  id: number;
  nombre: string;
  valor: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
}

export interface FiltrosPaquete {
  nombre?: string;
  activo?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

