import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import {
  ICuentaCobro,
  IPago,
} from '../components/cuentas-cobro/interfaces/cuenta-cobro.interface';
import { IEstadosCuentaCobroResponse } from '../components/cuentas-cobro/interfaces/estado-cuenta-cobro.interface';
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
    estado?: string;
    tiene_pdf?: string;
    si_envio_correo?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    paquete_id?: number;
  }): Observable<IPaginado<ICuentaCobro>> {
    const paramsConDefault: any = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      ...(params.filtro && { filtro: params.filtro }),
      ...(params.estado && { estado: params.estado }),
      ...(params.tiene_pdf && { tiene_pdf: params.tiene_pdf }),
      ...(params.si_envio_correo && {
        si_envio_correo: params.si_envio_correo,
      }),
      ...(params.fecha_inicio && { fecha_inicio: params.fecha_inicio }),
      ...(params.fecha_fin && { fecha_fin: params.fecha_fin }),
      ...(params.paquete_id && { paquete_id: params.paquete_id }),
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<ICuentaCobro>>(
      `${this.apiUrl}?${queryString}`,
    );
  }

  descargarPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }

  obtenerEstados(): Observable<IEstadosCuentaCobroResponse> {
    return this.http.get<IEstadosCuentaCobroResponse>(`${this.apiUrl}/estados`);
  }

  listarPagos(params: {
    pagina: number;
    tamano_pagina?: number;
    cliente_paquete_id: number;
  }): Observable<IPaginado<IPago>> {
    const paramsConDefault: any = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      cliente_paquete_id: params.cliente_paquete_id,
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<IPago>>(
      `${environment.apiUrl}/api/v1/pagos?${queryString}`,
    );
  }

  descargarPdfPago(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pago/pdf`, {
      responseType: 'blob',
    });
  }
}
