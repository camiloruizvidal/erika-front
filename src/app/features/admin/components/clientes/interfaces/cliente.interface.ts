export interface ICliente {
  id: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  identificacion?: string;
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

