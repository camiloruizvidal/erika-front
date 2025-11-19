import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IPaginado } from '../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { ICuentaCobro } from './interfaces/cuenta-cobro.interface';
import { IEstadoCuentaCobro } from './interfaces/estado-cuenta-cobro.interface';
import { CuentasCobroService } from '../../services/cuentas-cobro.service';

@Component({
  selector: 'app-cuentas-cobro',
  templateUrl: './cuentas-cobro.component.html',
  styleUrls: ['./cuentas-cobro.component.scss'],
})
export class CuentasCobroComponent implements OnInit, OnDestroy {
  datos: IPaginado<ICuentaCobro> | null = null;
  cargando = false;
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  estadoFiltro: string | null = null;
  tienePdfFiltro: string | null = null;
  siEnvioCorreoFiltro: string | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  estados: IEstadoCuentaCobro[] = [];
  cargandoEstados = false;
  private busquedaSubject = new Subject<string>();
  private busquedaSubscription?: Subscription;

  columnas: IColumnaTabla[] = [
    { nombre: 'Cliente', campo: 'nombre_cliente', ordenable: false },
    { nombre: 'Correo', campo: 'correo_cliente', ordenable: false },
    {
      nombre: 'Identificación',
      campo: 'identificacion_cliente',
      ordenable: false,
    },
    {
      nombre: 'Fecha de Cobro',
      campo: 'fecha_cobro',
      ordenable: false,
      formatear: (valor: Date) => {
        return new Date(valor).toLocaleDateString('es-CO');
      },
    },
    {
      nombre: 'Valor Total',
      campo: 'valor_total',
      ordenable: false,
      formatear: (valor: number) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(valor);
      },
    },
    { nombre: 'Estado', campo: 'estado', ordenable: false },
    {
      nombre: 'PDF',
      campo: 'tiene_pdf',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Sí' : 'No'),
    },
    {
      nombre: 'Correo Enviado',
      campo: 'si_envio_correo',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Sí' : 'No'),
    },
  ];

  constructor(
    private cuentasCobroService: CuentasCobroService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarCuentasCobro();
      });
    this.cargarEstados();
    this.cargarCuentasCobro();
  }

  cargarEstados(): void {
    this.cargandoEstados = true;
    this.cuentasCobroService.obtenerEstados().subscribe({
      next: (respuesta) => {
        this.estados = respuesta.estados;
        this.cargandoEstados = false;
      },
      error: (error) => {
        console.error('Error al cargar estados:', error);
        this.cargandoEstados = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
  }

  cargarCuentasCobro(): void {
    this.cargando = true;
    const params: {
      pagina: number;
      tamano_pagina?: number;
      filtro?: string;
      estado?: string;
      tiene_pdf?: string;
      si_envio_correo?: string;
      fecha_inicio?: string;
      fecha_fin?: string;
    } = {
      pagina: this.paginaActual,
    };

    if (this.tamanoPagina !== 10) {
      params.tamano_pagina = this.tamanoPagina;
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.filtro = this.terminoBusqueda.trim();
    }

    if (this.estadoFiltro) {
      params.estado = this.estadoFiltro;
    }

    if (this.tienePdfFiltro && this.tienePdfFiltro !== 'all') {
      params.tiene_pdf = this.tienePdfFiltro;
    }

    if (this.siEnvioCorreoFiltro && this.siEnvioCorreoFiltro !== 'all') {
      params.si_envio_correo = this.siEnvioCorreoFiltro;
    }

    if (this.fechaInicio) {
      params.fecha_inicio = this.fechaInicio;
    }

    if (this.fechaFin) {
      params.fecha_fin = this.fechaFin;
    }

    this.cuentasCobroService.listar(params).subscribe({
      next: (respuesta) => {
        this.datos = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cuentas de cobro:', error);
        this.cargando = false;
      },
    });
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarCuentasCobro();
  }

  onLimpiarFiltros(): void {
    this.estadoFiltro = null;
    this.tienePdfFiltro = null;
    this.siEnvioCorreoFiltro = null;
    this.fechaInicio = '';
    this.fechaFin = '';
    this.paginaActual = 1;
    this.cargarCuentasCobro();
  }

  onFiltroChange(): void {
    this.paginaActual = 1;
    this.cargarCuentasCobro();
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarCuentasCobro();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarCuentasCobro();
  }

  onFilaClick(cuentaCobro: ICuentaCobro): void {
    console.log('Click en cuenta de cobro:', cuentaCobro);
  }

  onOrdenar(orden: { campo: string; direccion: 'asc' | 'desc' }): void {
    console.log('Ordenar por:', orden);
  }

  onAccionSeleccionada(evento: { item: ICuentaCobro; accion: string }): void {
    const { item, accion } = evento;
    if (accion === 'detalle') {
      console.log('Ver detalle de cuenta de cobro:', item);
    } else if (accion === 'pdf' && item.tiene_pdf) {
      this.descargarPdf(item.id);
    }
  }

  descargarPdf(id: number): void {
    this.cuentasCobroService.descargarPdf(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
      },
    });
  }
}
