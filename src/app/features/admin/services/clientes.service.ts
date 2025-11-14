import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import {
  ICliente,
  ICrearClienteRequest,
} from '../components/clientes/interfaces/cliente.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private apiUrl = `${environment.apiUrl}/api/v1/customers`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina: number;
    filtro?: string;
  }): Observable<IPaginado<ICliente>> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.http.get<IPaginado<ICliente>>(`${this.apiUrl}?${queryString}`);
  }

  crear(datos: ICrearClienteRequest): Observable<ICliente> {
    return this.http.post<ICliente>(this.apiUrl, datos);
  }
}
