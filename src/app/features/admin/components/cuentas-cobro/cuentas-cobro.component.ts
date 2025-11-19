import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IPaginado } from '../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { ICuentaCobro } from './interfaces/cuenta-cobro.interface';
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
  private busquedaSubject = new Subject<string>();
  private busquedaSubscription?: Subscription;

  columnas: IColumnaTabla[] = [
    { nombre: 'Cliente', campo: 'nombreCliente', ordenable: false },
    { nombre: 'Correo', campo: 'correoCliente', ordenable: false },
    { nombre: 'Identificación', campo: 'identificacionCliente', ordenable: false },
    {
      nombre: 'Fecha de Cobro',
      campo: 'fechaCobro',
      ordenable: false,
      formatear: (valor: Date) => {
        return new Date(valor).toLocaleDateString('es-CO');
      },
    },
    {
      nombre: 'Valor Total',
      campo: 'valorTotal',
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
      campo: 'tienePdf',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Sí' : 'No'),
    },
    {
      nombre: 'Correo Enviado',
      campo: 'siEnvioCorreo',
      ordenable: false,
      formatear: (valor: boolean) => (valor ? 'Sí' : 'No'),
    },
  ];

  constructor(
    private cuentasCobroService: CuentasCobroService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarCuentasCobro();
      });
    this.cargarCuentasCobro();
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
    } = {
      pagina: this.paginaActual,
    };

    if (this.tamanoPagina !== 10) {
      params.tamano_pagina = this.tamanoPagina;
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.filtro = this.terminoBusqueda.trim();
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
    } else if (accion === 'pdf' && item.tienePdf) {
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

