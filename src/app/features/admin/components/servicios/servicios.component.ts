import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { IPaginado } from '../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { IServicio } from '../paquetes/interfaces/servicio.interface';
import { IPaquete } from '../paquetes/interfaces/paquete.interface';
import moment from 'moment';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.scss'],
})
export class ServiciosComponent implements OnInit, OnDestroy {
  datos: IPaginado<IServicio> | null = null;
  paquetes: IPaquete[] = [];
  cargando = false;
  cargandoPaquetes = false;
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  paqueteIdFiltro: number | null = null;
  private busquedaSubject = new Subject<string>();
  private busquedaSubscription?: Subscription;

  columnas: IColumnaTabla[] = [
    { nombre: 'Nombre', campo: 'nombre', ordenable: false },
    {
      nombre: 'Valor',
      campo: 'valor',
      ordenable: false,
      formatear: (valor: number) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(valor);
      },
    },
    {
      nombre: 'Paquetes',
      campo: 'paquetes',
      ordenable: false,
      renderizarHtml: true,
      formatear: (valor: any[] | undefined, item: any) => {
        if (!valor || valor.length === 0) {
          return '-';
        }
        return valor
          .map((paquete: any) => {
            const colorPunto = paquete.activo ? 'bg-success-500' : 'bg-error-500';
            const fechaInicio = paquete.fecha_inicio
              ? moment(paquete.fecha_inicio).format('DD/MM/YYYY')
              : '-';
            const fechaFin = paquete.fecha_fin
              ? moment(paquete.fecha_fin).format('DD/MM/YYYY')
              : '-';
            return `
              <div class="flex items-start gap-2 mb-2 last:mb-0">
                <span class="w-2 h-2 rounded-full ${colorPunto} mt-2 flex-shrink-0"></span>
                <div class="flex-1">
                  <div class="font-medium text-neutral-900">${paquete.nombre}</div>
                  <div class="text-xs text-neutral-500 mt-1">
                    <span>Inicio: ${fechaInicio}</span>
                    <span class="mx-2">•</span>
                    <span>Fin: ${fechaFin}</span>
                  </div>
                </div>
              </div>
            `;
          })
          .join('');
      },
    },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarServicios();
      });
    this.cargarPaquetes();
    this.cargarServicios();
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
  }

  cargarPaquetes(): void {
    this.cargandoPaquetes = true;
    this.http.get<IPaginado<IPaquete>>(`${environment.apiUrl}/api/v1/packages?pagina=1&tamano_pagina=1000`).subscribe({
      next: (respuesta) => {
        this.paquetes = respuesta.data;
        this.cargandoPaquetes = false;
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
        this.cargandoPaquetes = false;
      },
    });
  }

  cargarServicios(): void {
    this.cargando = true;
    const params: any = {
      pagina: this.paginaActual,
      tamano_pagina: this.tamanoPagina,
    };

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.nombre = this.terminoBusqueda.trim();
    }

    if (this.paqueteIdFiltro) {
      params.paquete_id = this.paqueteIdFiltro;
    }

    this.obtenerServicios(params).subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.cargando = false;
      },
    });
  }

  obtenerServicios(params: any): Observable<IPaginado<IServicio>> {
    const queryString = new URLSearchParams(params).toString();
    return this.http.get<IPaginado<IServicio>>(
      `${environment.apiUrl}/api/v1/services?${queryString}`
    );
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarServicios();
  }

  onPaqueteChange(paqueteId: number | null): void {
    this.paqueteIdFiltro = paqueteId;
    this.paginaActual = 1;
    this.cargarServicios();
  }

  onLimpiarFiltros(): void {
    this.paqueteIdFiltro = null;
    this.paginaActual = 1;
    this.cargarServicios();
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarServicios();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarServicios();
  }

  onFilaClick(servicio: IServicio): void {
    console.log('Click en servicio:', servicio);
  }

  onOrdenar(orden: { campo: string; direccion: 'asc' | 'desc' }): void {
    console.log('Ordenar por:', orden);
  }

  onAccionSeleccionada(evento: { item: IServicio; accion: string }): void {
    const { item, accion } = evento;
    if (accion === 'pagos') {
      console.log('Ver pagos de servicio:', item);
    } else if (accion === 'servicios') {
      console.log('Ver servicios de servicio:', item);
    }
  }
}

