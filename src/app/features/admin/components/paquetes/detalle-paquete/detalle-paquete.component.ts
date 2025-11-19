import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../../shared/components/tabla-paginada/tabla-paginada.component';
import {
  IPaqueteDetalle,
  IServicioAsociado,
} from '../interfaces/paquete.interface';
import { ICuentaCobro } from '../../cuentas-cobro/interfaces/cuenta-cobro.interface';
import moment from 'moment';
import 'moment/locale/es';
import { PaquetesService } from '../../../services/paquetes.service';
import { CuentasCobroService } from '../../../services/cuentas-cobro.service';

@Component({
  selector: 'app-detalle-paquete',
  templateUrl: './detalle-paquete.component.html',
  styleUrls: ['./detalle-paquete.component.scss'],
})
export class DetallePaqueteComponent implements OnInit {
  paquete: IPaqueteDetalle | null = null;
  servicios: IServicioAsociado[] = [];
  cargandoPaquete = false;
  paqueteId: number | null = null;

  // Cuentas de cobro
  datosCuentasCobro: IPaginado<ICuentaCobro> | null = null;
  cargandoCuentasCobro = false;
  paginaActualCuentasCobro = 1;
  tamanoPaginaCuentasCobro = 10;

  @ViewChild('templateEstado', { static: true })
  templateEstado!: TemplateRef<any>;
  @ViewChild('templatePdf', { static: true })
  templatePdf!: TemplateRef<any>;
  @ViewChild('templateCorreo', { static: true })
  templateCorreo!: TemplateRef<any>;
  @ViewChild('templateCliente', { static: true })
  templateCliente!: TemplateRef<any>;

  get templatesPersonalizados(): { [key: string]: TemplateRef<any> } {
    return {
      nombre_cliente: this.templateCliente,
      estado: this.templateEstado,
      tiene_pdf: this.templatePdf,
      si_envio_correo: this.templateCorreo,
    };
  }

  columnasCuentasCobro: IColumnaTabla[] = [
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
        const fecha = new Date(valor);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
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
    { nombre: 'PDF', campo: 'tiene_pdf', ordenable: false },
    { nombre: 'Correo Enviado', campo: 'si_envio_correo', ordenable: false },
  ];

  columnasServicios: IColumnaTabla[] = [
    { nombre: 'Nombre', campo: 'nombre', ordenable: false },
    {
      nombre: 'Valor',
      campo: 'valor',
      ordenable: false,
      formatear: (valor: number | null) => {
        if (valor === null) return '-';
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(valor);
      },
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paquetesService: PaquetesService,
    private cuentasCobroService: CuentasCobroService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.paqueteId = +params['id'];
      if (this.paqueteId) {
        this.cargarDetallePaquete();
        this.cargarCuentasCobro();
      }
    });
  }

  cargarDetallePaquete(): void {
    if (!this.paqueteId) return;

    this.cargandoPaquete = true;
    this.paquetesService.obtenerPorId(this.paqueteId).subscribe({
      next: (respuesta) => {
        this.paquete = respuesta;
        this.servicios = respuesta.servicios || [];
        this.cargandoPaquete = false;
      },
      error: (error) => {
        console.error('Error al cargar detalle del paquete:', error);
        this.cargandoPaquete = false;
      },
    });
  }

  onFilaClick(servicio: IServicioAsociado): void {
    console.log('Click en servicio:', servicio);
  }

  onOrdenar(orden: { campo: string; direccion: 'asc' | 'desc' }): void {
    console.log('Ordenar por:', orden);
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '-';
    return moment(fecha).locale('es').format('dddd D [de] MMMM [de] YYYY');
  }

  formatearValor(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(valor);
  }

  calcularSumaServicios(): number {
    if (!this.servicios || this.servicios.length === 0) return 0;
    return this.servicios.reduce((suma, servicio) => {
      return suma + (servicio.valor || 0);
    }, 0);
  }

  calcularDiferencia(): {
    valor: number;
    porcentaje: number;
    esAhorro: boolean;
  } {
    if (!this.paquete) return { valor: 0, porcentaje: 0, esAhorro: false };

    const sumaServicios = this.calcularSumaServicios();
    const valorPaquete = this.paquete.valor;
    const diferencia = sumaServicios - valorPaquete;
    const porcentaje =
      valorPaquete > 0 ? (Math.abs(diferencia) / valorPaquete) * 100 : 0;
    const esAhorro = diferencia > 0;

    return {
      valor: Math.abs(diferencia),
      porcentaje: porcentaje,
      esAhorro: esAhorro,
    };
  }

  volver(): void {
    this.router.navigate(['/admin/paquetes']);
  }

  cargarCuentasCobro(): void {
    if (!this.paqueteId) return;

    this.cargandoCuentasCobro = true;
    this.cuentasCobroService
      .listar({
        pagina: this.paginaActualCuentasCobro,
        tamano_pagina: this.tamanoPaginaCuentasCobro,
        paquete_id: this.paqueteId,
      })
      .subscribe({
        next: (respuesta) => {
          this.datosCuentasCobro = respuesta;
          this.cargandoCuentasCobro = false;
        },
        error: (error) => {
          console.error('Error al cargar cuentas de cobro:', error);
          this.cargandoCuentasCobro = false;
        },
      });
  }

  onCambiarPaginaCuentasCobro(pagina: number): void {
    this.paginaActualCuentasCobro = pagina;
    this.cargarCuentasCobro();
  }

  onCambiarTamanoPaginaCuentasCobro(tamano: number): void {
    this.tamanoPaginaCuentasCobro = tamano;
    this.paginaActualCuentasCobro = 1;
    this.cargarCuentasCobro();
  }

  onFilaClickCuentasCobro(cuentaCobro: ICuentaCobro): void {
    this.router.navigate(['/admin/clientes', cuentaCobro.cliente_id]);
  }

  verDetalleCliente(clienteId: number): void {
    this.router.navigate(['/admin/clientes', clienteId]);
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
