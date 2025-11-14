import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import {
  IPaquete,
  IFiltrosPaquete,
  IPaqueteDetalle,
} from '../components/paquetes/interfaces/paquete.interface';
import { ICrearPaqueteRequest } from '../components/paquetes/interfaces/servicio.interface';
import { QueryParamsUtil } from '../../../shared/utils/query-params.util';

@Injectable({
  providedIn: 'root',
})
export class PaquetesService {
  private apiUrl = `${environment.apiUrl}/api/v1/packages`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina?: number;
    nombre?: string;
    activo?: boolean;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Observable<IPaginado<IPaquete>> {
    const paramsConDefault = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      ...(params.nombre && { nombre: params.nombre }),
      ...(params.activo !== undefined &&
        params.activo !== null && { activo: params.activo }),
      ...(params.fecha_inicio && { fecha_inicio: params.fecha_inicio }),
      ...(params.fecha_fin && { fecha_fin: params.fecha_fin }),
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<IPaquete>>(`${this.apiUrl}?${queryString}`);
  }

  obtenerPorId(id: number): Observable<IPaqueteDetalle> {
    return this.http.get<IPaqueteDetalle>(`${this.apiUrl}/${id}`);
  }

  crear(datos: ICrearPaqueteRequest): Observable<IPaquete> {
    return this.http.post<IPaquete>(this.apiUrl, datos);
  }
}
