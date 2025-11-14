import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { IPaginado } from '../../../../shared/interfaces/paginado.interface';
import { ColumnaTabla } from '../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { Cliente } from './interfaces/cliente.interface';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit, OnDestroy {
  datos: IPaginado<Cliente> | null = null;
  cargando = false;
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  private busquedaSubject = new Subject<string>();
  private busquedaSubscription?: Subscription;

  columnas: ColumnaTabla[] = [
    { nombre: 'Nombre completo', campo: 'nombre_completo', ordenable: false },
    { nombre: 'Correo', campo: 'correo', ordenable: false },
    { nombre: 'Teléfono', campo: 'telefono', ordenable: false },
    { nombre: 'Identificación', campo: 'identificacion', ordenable: false },
    {
      nombre: 'Estado',
      campo: 'activo',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Activo' : 'Inactivo'),
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarClientes();
      });
    this.cargarClientes();
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
  }

  cargarClientes(): void {
    this.cargando = true;
    const params: any = {
      pagina: this.paginaActual,
      tamano_pagina: this.tamanoPagina,
    };

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.filtro = this.terminoBusqueda.trim();
    }

    this.obtenerClientes(params).subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.cargando = false;
      },
    });
  }

  obtenerClientes(params: any): Observable<IPaginado<Cliente>> {
    const queryString = new URLSearchParams(params).toString();
    return this.http.get<IPaginado<Cliente>>(
      `${environment.apiUrl}/api/v1/customers?${queryString}`
    );
  }

  onCrear(): void {
    this.router.navigate(['/admin/clientes/crear']);
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarClientes();
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarClientes();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarClientes();
  }

  onFilaClick(cliente: Cliente): void {
    console.log('Click en cliente:', cliente);
  }

  onOrdenar(orden: { campo: string; direccion: 'asc' | 'desc' }): void {
    console.log('Ordenar por:', orden);
  }

  onAccionSeleccionada(evento: { item: Cliente; accion: string }): void {
    const { item, accion } = evento;
    if (accion === 'pagos') {
      console.log('Ver pagos de cliente:', item);
    } else if (accion === 'servicios') {
      console.log('Ver servicios de cliente:', item);
    }
  }

  formatearEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
