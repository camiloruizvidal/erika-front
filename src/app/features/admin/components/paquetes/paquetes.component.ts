import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IPaginado } from '../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { IPaquete, IFiltrosPaquete } from './interfaces/paquete.interface';
import moment from 'moment';
import { PaquetesService } from '../../services/paquetes.service';

@Component({
  selector: 'app-paquetes',
  templateUrl: './paquetes.component.html',
  styleUrls: ['./paquetes.component.scss'],
})
export class PaquetesComponent implements OnInit, OnDestroy {
  datos: IPaginado<IPaquete> | null = null;
  cargando = false;
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  filtros: IFiltrosPaquete = {};
  mostrarFiltros = false;
  fechaMaxima = new Date();
  fechaInicioFiltro: string | null = null;
  fechaFinFiltro: string | null = null;
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
      nombre: 'Fecha Inicio',
      campo: 'fecha_inicio',
      ordenable: false,
      formatear: (valor: string) => {
        return valor ? moment(valor).format('DD/MM/YYYY') : '-';
      },
    },
    {
      nombre: 'Fecha Fin',
      campo: 'fecha_fin',
      ordenable: false,
      formatear: (valor: string | null) => {
        return valor ? moment(valor).format('DD/MM/YYYY') : '-';
      },
    },
    {
      nombre: 'Estado',
      campo: 'activo',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Activo' : 'Inactivo'),
    },
  ];

  constructor(
    private paquetesService: PaquetesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarPaquetes();
      });
    this.cargarPaquetes();
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
  }

  cargarPaquetes(): void {
    this.cargando = true;
    const params: any = {
      pagina: this.paginaActual,
      tamano_pagina: this.tamanoPagina,
    };

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.nombre = this.terminoBusqueda.trim();
    }

    if (this.filtros.activo !== undefined && this.filtros.activo !== null) {
      params.activo = this.filtros.activo;
    }

    if (this.filtros.fecha_inicio) {
      params.fecha_inicio = moment(this.filtros.fecha_inicio)
        .format('YYYY-MM-DD');
    }

    if (this.filtros.fecha_fin) {
      params.fecha_fin = moment(this.filtros.fecha_fin).format('YYYY-MM-DD');
    }

    this.paquetesService.listar(params).subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar paquetes:', error);
        this.cargando = false;
      },
    });
  }

  onCrear(): void {
    this.router.navigate(['/admin/paquetes/crear']);
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarPaquetes();
  }

  onAplicarFiltros(filtros: IFiltrosPaquete): void {
    this.filtros = { ...filtros };
    this.paginaActual = 1;
    this.cargarPaquetes();
  }

  onLimpiarFiltros(): void {
    this.filtros = {};
    this.fechaInicioFiltro = null;
    this.fechaFinFiltro = null;
    this.paginaActual = 1;
    this.cargarPaquetes();
  }

  onFechaInicioChange(fecha: string | null): void {
    this.fechaInicioFiltro = fecha;
    if (fecha) {
      this.filtros.fecha_inicio = fecha;
    } else {
      delete this.filtros.fecha_inicio;
    }
    this.onAplicarFiltros(this.filtros);
  }

  onFechaFinChange(fecha: string | null): void {
    this.fechaFinFiltro = fecha;
    if (fecha) {
      this.filtros.fecha_fin = fecha;
    } else {
      delete this.filtros.fecha_fin;
    }
    this.onAplicarFiltros(this.filtros);
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarPaquetes();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarPaquetes();
  }

  onFilaClick(paquete: IPaquete): void {
    this.router.navigate(['/admin/paquetes', paquete.id]);
  }

  onOrdenar(orden: { campo: string; direccion: 'asc' | 'desc' }): void {
    console.log('Ordenar por:', orden);
  }
}

