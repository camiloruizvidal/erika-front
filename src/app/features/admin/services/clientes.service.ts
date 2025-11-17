import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import {
  ICliente,
  ICrearClienteRequest,
  IClientePaquete,
} from '../components/clientes/interfaces/cliente.interface';
import { QueryParamsUtil } from '../../../shared/utils/query-params.util';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/api/v1/customers`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina?: number;
    filtro?: string;
  }): Observable<IPaginado<ICliente>> {
    const paramsConDefault = {
      pagina: params.pagina,
      tamano_pagina: params.tamano_pagina ?? 10,
      ...(params.filtro && { filtro: params.filtro }),
    };
    const queryString = QueryParamsUtil.construir(paramsConDefault);
    return this.http.get<IPaginado<ICliente>>(`${this.apiUrl}?${queryString}`);
  }

  crear(datos: ICrearClienteRequest): Observable<ICliente> {
    return this.http.post<ICliente>(this.apiUrl, datos);
  }

  obtenerDetalle(clienteId: number): Observable<ICliente> {
    return this.http.get<ICliente>(`${this.apiUrl}/${clienteId}`);
  }

  obtenerPaquetes(clienteId: number): Observable<IClientePaquete[]> {
    return this.http.get<IClientePaquete[]>(
      `${this.apiUrl}/${clienteId}/packages`
    );
  }

  asignarPaquete(clienteId: number, datos: any): Observable<IClientePaquete> {
    return this.http.post<IClientePaquete>(
      `${this.apiUrl}/${clienteId}/packages`,
      datos
    );
  }
}
