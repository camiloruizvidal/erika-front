export interface ICuentaCobro {
  id: number;
  cliente_id: number;
  nombre_cliente: string;
  correo_cliente: string;
  identificacion_cliente: string | null;
  fecha_cobro: Date;
  valor_total: number;
  estado: string;
  tiene_pdf: boolean;
  si_envio_correo: boolean;
  fecha_envio_correo: Date | null;
  fecha_pago?: Date | null;
  valor_pagado?: number | null;
  url_pdf_pago?: string | null;
}

export interface IPago {
  id: number;
  cliente_id: number;
  nombre_cliente: string;
  correo_cliente: string;
  identificacion_cliente: string | null;
  fecha_cobro: Date;
  valor_total: number;
  fecha_pago: Date | null;
  valor_pagado: number | null;
  tiene_pdf_pago: boolean;
}
