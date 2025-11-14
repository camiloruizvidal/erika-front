export interface IServicio {
  id: number;
  nombre: string;
  valor: number;
  paquetes?: { id: number; nombre: string }[];
}

export interface ICrearPaqueteRequest {
  nombre: string;
  valor: number;
  fecha_inicio: string;
  fecha_fin?: string | null;
  activo?: boolean;
  servicios: {
    nombre_servicio: string;
    valor_servicio: number;
  }[];
}
