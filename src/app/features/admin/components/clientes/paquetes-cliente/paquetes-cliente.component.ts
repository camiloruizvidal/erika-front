import { Component, Input, OnInit } from '@angular/core';
import { IClientePaquete } from '../interfaces/cliente.interface';
import { ClientesService } from '../../../services/clientes.service';
import { CuentasCobroService } from '../../../services/cuentas-cobro.service';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import { IPago } from '../../cuentas-cobro/interfaces/cuenta-cobro.interface';
import moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-paquetes-cliente',
  templateUrl: './paquetes-cliente.component.html',
  styleUrls: ['./paquetes-cliente.component.scss'],
})
export class PaquetesClienteComponent implements OnInit {
  @Input() clienteId!: number;

  paquetes: IClientePaquete[] = [];
  cargandoPaquetes = false;
  pagosPorPaquete: { [key: number]: IPaginado<IPago> | null } = {};
  cargandoPagosPorPaquete: { [key: number]: boolean } = {};
  paginaActualPorPaquete: { [key: number]: number } = {};
  tamanoPaginaPorPaquete: { [key: number]: number } = {};

  constructor(
    private clientesService: ClientesService,
    private cuentasCobroService: CuentasCobroService,
  ) {}

  ngOnInit(): void {
    if (this.clienteId) {
      this.cargarPaquetes();
    }
  }

  cargarPaquetes(): void {
    if (!this.clienteId) return;

    this.cargandoPaquetes = true;
    this.clientesService.obtenerPaquetes(this.clienteId).subscribe({
      next: (respuesta) => {
        this.paquetes = respuesta;
        this.cargandoPaquetes = false;
        this.paquetes.forEach((paquete) => {
          this.paginaActualPorPaquete[paquete.id] = 1;
          this.tamanoPaginaPorPaquete[paquete.id] = 10;
          this.cargarPagos(paquete.id);
        });
      },
      error: (error) => {
        console.error('Error al cargar paquetes del cliente:', error);
        this.cargandoPaquetes = false;
      },
    });
  }

  cargarPagos(clientePaqueteId: number): void {
    this.cargandoPagosPorPaquete[clientePaqueteId] = true;
    const pagina = this.paginaActualPorPaquete[clientePaqueteId] || 1;
    const tamanoPagina = this.tamanoPaginaPorPaquete[clientePaqueteId] || 10;

    this.cuentasCobroService
      .listarPagos({
        pagina,
        tamano_pagina: tamanoPagina,
        cliente_paquete_id: clientePaqueteId,
      })
      .subscribe({
        next: (respuesta) => {
          this.pagosPorPaquete[clientePaqueteId] = respuesta;
          this.cargandoPagosPorPaquete[clientePaqueteId] = false;
        },
        error: (error) => {
          console.error('Error al cargar pagos del paquete:', error);
          this.cargandoPagosPorPaquete[clientePaqueteId] = false;
        },
      });
  }

  cambiarPaginaPagos(clientePaqueteId: number, pagina: number): void {
    this.paginaActualPorPaquete[clientePaqueteId] = pagina;
    this.cargarPagos(clientePaqueteId);
  }

  cambiarTamanoPaginaPagos(clientePaqueteId: number, tamano: number): void {
    this.tamanoPaginaPorPaquete[clientePaqueteId] = tamano;
    this.paginaActualPorPaquete[clientePaqueteId] = 1;
    this.cargarPagos(clientePaqueteId);
  }

  obtenerNumeroFila(clientePaqueteId: number, index: number): number {
    const pagina = this.paginaActualPorPaquete[clientePaqueteId] || 1;
    const tamanoPagina = this.tamanoPaginaPorPaquete[clientePaqueteId] || 10;
    return (pagina - 1) * tamanoPagina + index + 1;
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

  formatearFechaPago(fecha: Date | null | undefined): string {
    if (!fecha) return '-';
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
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

  calcularDiaGracia(diaCobro: number, diasGracia: number): string {
    const diaFinal = diaCobro + diasGracia;
    return `Día ${diaFinal} de cada mes`;
  }

  Math = Math;
}
