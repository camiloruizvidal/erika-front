import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPaginado } from '../../../shared/interfaces/paginado.interface';
import { IServicio } from '../components/paquetes/interfaces/servicio.interface';
import { IPaquete } from '../components/paquetes/interfaces/paquete.interface';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  private apiUrl = `${environment.apiUrl}/api/v1/services`;
  private paquetesApiUrl = `${environment.apiUrl}/api/v1/packages`;

  constructor(private http: HttpClient) {}

  listar(params: {
    pagina: number;
    tamano_pagina: number;
    nombre?: string;
    paquete_id?: number;
  }): Observable<IPaginado<IServicio>> {
    const queryString = new URLSearchParams(
      params as any
    ).toString();
    return this.http.get<IPaginado<IServicio>>(
      `${this.apiUrl}?${queryString}`
    );
  }

  listarPaquetes(): Observable<IPaginado<IPaquete>> {
    return this.http.get<IPaginado<IPaquete>>(
      `${this.paquetesApiUrl}?pagina=1&tamano_pagina=1000`
    );
  }
}

