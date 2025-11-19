import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ICliente } from '../interfaces/cliente.interface';
import { ClientesService } from '../../../services/clientes.service';
import { PaquetesService } from '../../../services/paquetes.service';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import {
  IPaquete,
  IFiltrosPaquete,
  IPaqueteDetalle,
  IServicioAsociado,
} from '../../paquetes/interfaces/paquete.interface';
import { IColumnaTabla } from '../../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import {
  EFrecuenciaTipo,
  FrecuenciaTipo,
} from '../../../../../shared/enums/frecuencia-tipo.enum';
import moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-detalle-cliente',
  templateUrl: './detalle-cliente.component.html',
  styleUrls: ['./detalle-cliente.component.scss'],
})
export class DetalleClienteComponent implements OnInit, OnDestroy {
  cliente: ICliente | null = null;
  paquetesDisponibles: IPaginado<IPaquete> | null = null;
  cargando = false;
  cargandoPaquetesDisponibles = false;
  clienteId: number | null = null;
  tabActivo = 'registrados';
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  filtros: IFiltrosPaquete = {};
  mostrarModalAsignacion = false;
  paqueteSeleccionado: IPaqueteDetalle | null = null;
  valorAcordado: number = 0;
  diaCobro: number = 1;
  frecuenciaValor: number = 1;
  cargandoDetallePaquete = false;
  asignandoPaquete = false;
  errorAsignacion: string | null = null;
  EFrecuenciaTipo = EFrecuenciaTipo;

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
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private paquetesService: PaquetesService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarPaquetesDisponibles();
      });

    this.route.params.subscribe((params) => {
      this.clienteId = +params['id'];
      if (this.clienteId) {
        this.cargarDetalleCliente();
      }
    });
  }

  ngOnDestroy(): void {
    this.busquedaSubscription?.unsubscribe();
  }

  cargarDetalleCliente(): void {
    if (!this.clienteId) return;

    this.cargando = true;
    this.clientesService.obtenerDetalle(this.clienteId).subscribe({
      next: (respuesta) => {
        this.cliente = respuesta;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del cliente:', error);
        this.cargando = false;
      },
    });
  }


  formatearFecha(fecha: string | null | undefined): string {
    if (!fecha) return '-';
    return moment(fecha).locale('es').format('dddd D [de] MMMM [de] YYYY');
  }

  formatearValor(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(valor);
  }

  obtenerValor(item: any, campo: string): any {
    const campos = campo.split('.');
    let valor = item;
    for (const c of campos) {
      valor = valor?.[c];
    }
    return valor ?? '';
  }

  Math = Math;

  cambiarTab(tab: string): void {
    this.tabActivo = tab;
    if (tab === 'disponibles' && !this.paquetesDisponibles) {
      this.cargarPaquetesDisponibles();
    }
  }

  cargarPaquetesDisponibles(): void {
    this.cargandoPaquetesDisponibles = true;
    const params: {
      pagina: number;
      tamano_pagina?: number;
      nombre?: string;
      activo?: boolean;
      fecha_inicio?: string;
      fecha_fin?: string;
    } = {
      pagina: this.paginaActual,
    };

    if (this.tamanoPagina !== 10) {
      params.tamano_pagina = this.tamanoPagina;
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.nombre = this.terminoBusqueda.trim();
    }

    if (this.filtros.activo !== undefined && this.filtros.activo !== null) {
      params.activo = this.filtros.activo;
    }

    if (this.filtros.fecha_inicio) {
      params.fecha_inicio = moment(this.filtros.fecha_inicio).format(
        'YYYY-MM-DD'
      );
    }

    if (this.filtros.fecha_fin) {
      params.fecha_fin = moment(this.filtros.fecha_fin).format('YYYY-MM-DD');
    }

    this.paquetesService.listar(params).subscribe({
      next: (respuesta) => {
        this.paquetesDisponibles = respuesta;
        this.cargandoPaquetesDisponibles = false;
      },
      error: (error) => {
        console.error('Error al cargar paquetes disponibles:', error);
        this.cargandoPaquetesDisponibles = false;
      },
    });
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.cargarPaquetesDisponibles();
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarPaquetesDisponibles();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarPaquetesDisponibles();
  }

  seleccionarPaquete(paquete: IPaquete): void {
    this.cargandoDetallePaquete = true;
    this.mostrarModalAsignacion = true;
    this.paquetesService.obtenerPorId(paquete.id).subscribe({
      next: (detalle) => {
        this.paqueteSeleccionado = detalle;
        this.valorAcordado = detalle.valor;
        this.diaCobro = 1;
        this.frecuenciaValor = detalle.frecuencia_valor || 1;
        this.cargandoDetallePaquete = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del paquete:', error);
        this.cargandoDetallePaquete = false;
        this.cerrarModal();
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModalAsignacion = false;
    this.paqueteSeleccionado = null;
    this.valorAcordado = 0;
    this.diaCobro = 1;
    this.frecuenciaValor = 1;
    this.errorAsignacion = null;
  }

  confirmarAsignacion(): void {
    if (!this.clienteId || !this.paqueteSeleccionado) return;

    this.errorAsignacion = null;

    const serviciosIds = this.paqueteSeleccionado.servicios.map((s) => s.id);

    const datos: any = {
      paquete_id: this.paqueteSeleccionado.id,
      valor_paquete: this.valorAcordado,
      frecuencia_tipo: this.paqueteSeleccionado.frecuencia_tipo,
      servicios: serviciosIds,
    };

    if (this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.MENSUAL) {
      datos.dia_cobro = this.diaCobro;
    } else if (
      this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.SEMANAS ||
      this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.SERVICIOS
    ) {
      datos.frecuencia_valor = this.paqueteSeleccionado.frecuencia_valor;
    }

    this.asignandoPaquete = true;
    this.clientesService.asignarPaquete(this.clienteId, datos).subscribe({
      next: () => {
        this.asignandoPaquete = false;
        this.notificationService
          .exito('Paquete asignado exitosamente')
          .then(() => {
            this.cerrarModal();
            this.tabActivo = 'registrados';
          });
      },
      error: (error) => {
        console.error('Error al asignar paquete:', error);
        this.asignandoPaquete = false;
        this.errorAsignacion =
          error.error?.message ||
          'Error al asignar el paquete. Verifica los datos e intenta nuevamente.';
      },
    });
  }

  calcularSumaServicios(): number {
    if (!this.paqueteSeleccionado?.servicios) return 0;
    return this.paqueteSeleccionado.servicios.reduce((suma, servicio) => {
      return suma + (servicio.valor || 0);
    }, 0);
  }

  calcularDiaGracia(diaCobro: number, diasGracia: number): string {
    const diaFinal = diaCobro + diasGracia;
    return `Día ${diaFinal} de cada mes`;
  }

  obtenerDiaSemanaTexto(): string {
    if (!this.paqueteSeleccionado?.fecha_inicio) return '';
    const fecha = moment(this.paqueteSeleccionado.fecha_inicio);
    const diasSemana = [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado',
    ];
    return diasSemana[fecha.day()];
  }

  obtenerTextoFrecuencia(): string {
    if (!this.paqueteSeleccionado) return '';

    if (this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.MENSUAL) {
      return 'Se cobrará mensualmente';
    }

    if (this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.SEMANAS) {
      const diaSemana = this.obtenerDiaSemanaTexto();
      const frecuenciaValor = this.paqueteSeleccionado.frecuencia_valor || 1;
      return `Se cobrará el ${diaSemana} de cada ${frecuenciaValor} ${
        frecuenciaValor === 1 ? 'semana' : 'semanas'
      }`;
    }

    if (this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.ANUAL) {
      return 'Se cobrará una vez al año';
    }

    if (
      this.paqueteSeleccionado.frecuencia_tipo === EFrecuenciaTipo.SERVICIOS
    ) {
      const frecuenciaValor = this.paqueteSeleccionado.frecuencia_valor || 1;
      return `Se cobrará cada ${frecuenciaValor} ${
        frecuenciaValor === 1 ? 'servicio' : 'servicios'
      }`;
    }

    return '';
  }

  volver(): void {
    this.router.navigate(['/admin/clientes']);
  }
}
