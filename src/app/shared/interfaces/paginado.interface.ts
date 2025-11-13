export interface IMetaPaginado {
  total: number;
  pagina: number;
  tamano_pagina: number;
  total_paginas: number;
}

export interface IPaginado<T> {
  meta: IMetaPaginado;
  data: T[];
}

