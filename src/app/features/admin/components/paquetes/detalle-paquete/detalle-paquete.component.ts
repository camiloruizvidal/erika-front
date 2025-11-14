import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../../shared/components/tabla-paginada/tabla-paginada.component';
import {
  IPaqueteDetalle,
  IServicioAsociado,
} from '../interfaces/paquete.interface';
import moment from 'moment';
import 'moment/locale/es';
import { PaquetesService } from '../../../services/paquetes.service';

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
    private paquetesService: PaquetesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.paqueteId = +params['id'];
      if (this.paqueteId) {
        this.cargarDetallePaquete();
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
}
