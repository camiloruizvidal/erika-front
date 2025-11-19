export interface IEstadoCuentaCobro {
  valor: string;
  etiqueta: string;
}

export interface IEstadosCuentaCobroResponse {
  estados: IEstadoCuentaCobro[];
}
