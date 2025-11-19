import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import {
  IDashboardData,
  IDashboardKpi,
  IAlertaRapida,
  IGraficaFacturadoRecaudado,
  IGraficaPagosPorDia,
  IClientePrincipal,
  IEstadoCuentas,
  IUltimoMovimiento,
  IEstadoSuscripcion,
} from './interfaces/dashboard.interface';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  cargando = true;
  datosDashboard: IDashboardData | null = null;

  chartFacturadoRecaudado: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartFacturadoRecaudadoOptions: ChartConfiguration<'bar'>['options'] = {};

  chartPagosPorDia: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartPagosPorDiaOptions: ChartConfiguration<'line'>['options'] = {};

  chartEstadoCuentas: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartEstadoCuentasOptions: ChartConfiguration<'doughnut'>['options'] = {};

  chartClientesPrincipales: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [],
  };
  chartClientesPrincipalesOptions: ChartConfiguration<'bar'>['options'] = {};

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  ngOnDestroy(): void {}

  cargarDashboard(): void {
    this.cargando = true;
    this.dashboardService.obtenerDashboard().subscribe({
      next: (datos) => {
        this.datosDashboard = datos;
        this.inicializarGraficas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
        this.cargando = false;
      },
    });
  }

  inicializarGraficas(): void {
    if (!this.datosDashboard) return;

    this.configurarGraficaFacturadoRecaudado();
    this.configurarGraficaPagosPorDia();
    this.configurarGraficaEstadoCuentas();
    this.configurarGraficaClientesPrincipales();
  }

  configurarGraficaFacturadoRecaudado(): void {
    if (!this.datosDashboard) return;

    const datosGrafica = this.datosDashboard.grafica_facturado_recaudado || [];
    const meses = datosGrafica.map((datoGrafica) => {
      const [anio, mes] = datoGrafica.mes.split('-');
      const mesesNombres = [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ];
      return mesesNombres[parseInt(mes) - 1] || mes;
    });

    this.chartFacturadoRecaudado = {
      labels: meses,
      datasets: [
        {
          label: 'Facturado',
          data: datosGrafica.map((datoGrafica) => Number(datoGrafica.facturado) || 0),
          backgroundColor: '#3B82F6',
        },
        {
          label: 'Recaudado',
          data: datosGrafica.map((datoGrafica) => Number(datoGrafica.recaudado) || 0),
          backgroundColor: '#10B981',
        },
      ],
    };

    this.chartFacturadoRecaudadoOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (valor) => {
              return `$${this.formatearNumero(Number(valor))}`;
            },
          },
        },
      },
    };
  }

  configurarGraficaPagosPorDia(): void {
    if (!this.datosDashboard) return;

    const datosPagos = this.datosDashboard.grafica_pagos_por_dia || [];

    this.chartPagosPorDia = {
      labels: datosPagos.map((datoPago) => {
        try {
          const fecha = new Date(datoPago.fecha);
          return fecha.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        } catch {
          return datoPago.fecha;
        }
      }),
      datasets: [
        {
          label: 'Pagos',
          data: datosPagos.map((datoPago) => Number(datoPago.cantidad) || 0),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    this.chartPagosPorDiaOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };
  }

  configurarGraficaEstadoCuentas(): void {
    if (!this.datosDashboard) return;

    const estado = this.datosDashboard.estado_cuentas || {
      pagadas: 0,
      pendientes: 0,
      vencidas: 0,
      porcentaje_pagadas: 0,
      porcentaje_pendientes: 0,
      porcentaje_vencidas: 0,
    };

    this.chartEstadoCuentas = {
      labels: ['Pagadas', 'Pendientes', 'Vencidas'],
      datasets: [
        {
          data: [
            Number(estado.porcentaje_pagadas) || 0,
            Number(estado.porcentaje_pendientes) || 0,
            Number(estado.porcentaje_vencidas) || 0,
          ],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        },
      ],
    };

    this.chartEstadoCuentasOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.label}: ${context.parsed.toFixed(1)}%`;
            },
          },
        },
      },
    };
  }

  configurarGraficaClientesPrincipales(): void {
    if (!this.datosDashboard) return;

    const clientesPrincipales = (this.datosDashboard.clientes_principales || []).slice(0, 5);

    this.chartClientesPrincipales = {
      labels: clientesPrincipales.map((cliente) => cliente.nombre_cliente),
      datasets: [
        {
          label: 'Monto Total',
          data: clientesPrincipales.map((cliente) => Number(cliente.monto_total) || 0),
          backgroundColor: '#3B82F6',
        },
      ],
    };

    this.chartClientesPrincipalesOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `$${this.formatearNumero(Number(context.parsed.x))}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (valor) => {
              return `$${this.formatearNumero(Number(valor))}`;
            },
          },
        },
      },
    };
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  obtenerIconoAlerta(tipo: string): string {
    switch (tipo) {
      case 'vencen_hoy':
        return 'fa-exclamation-triangle';
      case 'atrasados':
        return 'fa-bell';
      case 'pago_parcial':
        return 'fa-money-bill-wave';
      case 'bloqueada':
        return 'fa-lock';
      default:
        return 'fa-info-circle';
    }
  }

  obtenerColorAlerta(tipo: string): string {
    switch (tipo) {
      case 'vencen_hoy':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'atrasados':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'pago_parcial':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'bloqueada':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  obtenerColorVariacion(variacion: number): string {
    if (variacion > 0) return 'text-green-600';
    if (variacion < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  obtenerIconoVariacion(variacion: number): string {
    if (variacion > 0) return 'fa-arrow-up';
    if (variacion < 0) return 'fa-arrow-down';
    return 'fa-minus';
  }

  obtenerColorEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
      case 'mora':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
