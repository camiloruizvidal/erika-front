export interface IPaquete {
  id: number;
  nombre: string;
  valor: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
}

export interface IFiltrosPaquete {
  nombre?: string;
  activo?: boolean;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface IPaqueteDetalle {
  id: number;
  nombre: string;
  valor: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
  servicios: IServicioAsociado[];
}

export interface IServicioAsociado {
  id: number;
  nombre: string;
  valor: number | null;
}

export interface IServicioPaquete {
  id: number;
  nombre: string;
  valor: number;
}

