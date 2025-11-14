import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import { IServicio } from '../components/paquetes/interfaces/servicio.interface';
import { IPaquete } from '../components/paquetes/interfaces/paquete.interface';
import { QueryParamsUtil } from '../../../shared/utils/query-params.util';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/api/v1/services`;
  private paquetesApiUrl = `${environment.apiUrl}/api/v1/packages`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina?: number;
    nombre?: string;
    paquete_id?: number;
  }): Observable<IPaginado<IServicio>> {
    const paramsConDefault = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      ...(params.nombre && { nombre: params.nombre }),
      ...(params.paquete_id && { paquete_id: params.paquete_id }),
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<IServicio>>(`${this.apiUrl}?${queryString}`);
  }

  listarPaquetes(tamanoPagina: number = 1000): Observable<IPaginado<IPaquete>> {
    const params = {
      pagina: 1,
      tamano_pagina: tamanoPagina,
    };
    const queryString = QueryParamsUtil.construir(params);
    return this.http.get<IPaginado<IPaquete>>(
      `${this.paquetesApiUrl}?${queryString}`
    );
  }
}
