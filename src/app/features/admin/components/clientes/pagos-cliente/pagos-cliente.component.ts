import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { IPago } from '../../cuentas-cobro/interfaces/cuenta-cobro.interface';
import { CuentasCobroService } from '../../../services/cuentas-cobro.service';

@Component({
  selector: 'app-pagos-cliente',
  templateUrl: './pagos-cliente.component.html',
  styleUrls: ['./pagos-cliente.component.scss'],
})
export class PagosClienteComponent implements OnInit {
  @Input() clientePaqueteId!: number;

  datosPagos: IPaginado<IPago> | null = null;
  cargandoPagos = false;
  paginaActualPagos = 1;
  tamanoPaginaPagos = 10;

  @ViewChild('templatePdfPago', { static: true })
  templatePdfPago!: TemplateRef<any>;

  get templatesPersonalizadosPagos(): { [key: string]: TemplateRef<any> } {
    return {
      tiene_pdf_pago: this.templatePdfPago,
    };
  }

  columnasPagos: IColumnaTabla[] = [
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
    {
      nombre: 'Fecha de Pago',
      campo: 'fecha_pago',
      ordenable: false,
      formatear: (valor: Date | null) => {
        if (!valor) return '-';
        const fecha = new Date(valor);
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
      },
    },
    {
      nombre: 'Valor Pagado',
      campo: 'valor_pagado',
      ordenable: false,
      formatear: (valor: number | null) => {
        if (valor === null) return '-';
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(valor);
      },
    },
    { nombre: 'PDF Recibo', campo: 'tiene_pdf_pago', ordenable: false },
  ];

  constructor(private cuentasCobroService: CuentasCobroService) {}

  ngOnInit(): void {
    if (this.clientePaqueteId) {
      this.cargarPagos();
    }
  }

  cargarPagos(): void {
    if (!this.clientePaqueteId) return;

    this.cargandoPagos = true;
    this.cuentasCobroService
      .listarPagos({
        pagina: this.paginaActualPagos,
        tamano_pagina: this.tamanoPaginaPagos,
        cliente_paquete_id: this.clientePaqueteId,
      })
      .subscribe({
        next: (respuesta) => {
          this.datosPagos = respuesta;
          this.cargandoPagos = false;
        },
        error: (error) => {
          console.error('Error al cargar pagos:', error);
          this.cargandoPagos = false;
        },
      });
  }

  onCambiarPaginaPagos(pagina: number): void {
    this.paginaActualPagos = pagina;
    this.cargarPagos();
  }

  onCambiarTamanoPaginaPagos(tamano: number): void {
    this.tamanoPaginaPagos = tamano;
    this.paginaActualPagos = 1;
    this.cargarPagos();
  }

  descargarPdfPago(id: number): void {
    this.cuentasCobroService.descargarPdfPago(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Error al descargar PDF de pago:', error);
      },
    });
  }
}

