export interface ICliente {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  nombre_completo: string;
  tipo_documento_id?: number | null;
  correo: string;
  telefono?: string | null;
  identificacion?: string | null;
  fecha_nacimiento?: string | null;
  direccion?: string | null;
  activo: boolean;
}

export interface ITipoDocumento {
  id: number;
  nombre: string;
}

export interface ICrearClienteRequest {
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  tipo_documento_id: number;
  correo: string;
  telefono?: string;
  identificacion?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  activo?: boolean;
}

export interface IClientePaquete {
  id: number;
  cliente_id: number;
  paquete_original_id: number;
  nombre_paquete: string;
  valor_original: number;
  valor_acordado: number;
  dia_cobro: number | null;
  dias_gracia: number | null;
  frecuencia_tipo: string;
  frecuencia_valor: number | null;
  fecha_inicio: string;
  fecha_fin: string | null;
  mora_porcentaje: number | null;
  mora_valor: number | null;
  estado: string;
  servicios: IServicioAsignado[];
}

export interface IServicioAsignado {
  id: number;
  servicio_original_id: number;
  nombre_servicio: string;
  valor_original: number;
  valor_acordado: number;
}

