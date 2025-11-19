import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import { ICuentaCobro } from '../components/cuentas-cobro/interfaces/cuenta-cobro.interface';
import { QueryParamsUtil } from '../../../shared/utils/query-params.util';

@Injectable({
  providedIn: 'root',
})
export class CuentasCobroService {
  private apiUrl = `${environment.apiUrl}/api/v1/billing`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina?: number;
    filtro?: string;
  }): Observable<IPaginado<ICuentaCobro>> {
    const paramsConDefault = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      ...(params.filtro && { filtro: params.filtro }),
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<ICuentaCobro>>(`${this.apiUrl}?${queryString}`);
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }
}

