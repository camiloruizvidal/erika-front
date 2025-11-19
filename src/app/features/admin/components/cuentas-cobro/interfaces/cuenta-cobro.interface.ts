export interface ICuentaCobro {
  id: number;
  clienteId: number;
  nombreCliente: string;
  correoCliente: string;
  identificacionCliente: string | null;
  fechaCobro: Date;
  valorTotal: number;
  estado: string;
  tienePdf: boolean;
  siEnvioCorreo: boolean;
  fechaEnvioCorreo: Date | null;
}

