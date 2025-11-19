export interface IDashboardKpi {
  total_facturado: number;
  total_recaudado: number;
  ingresos_erika: number;
  cuentas_generadas: number;
  variacion_facturado: number;
  variacion_recaudado: number;
  variacion_ingresos_erika: number;
  variacion_cuentas_generadas: number;
}

export interface IAlertaRapida {
  tipo: string;
  mensaje: string;
  cantidad: number;
}

export interface IGraficaFacturadoRecaudado {
  mes: string;
  facturado: number;
  recaudado: number;
}

export interface IGraficaPagosPorDia {
  fecha: string;
  cantidad: number;
}

export interface IClientePrincipal {
  cliente_id: number;
  nombre_cliente: string;
  monto_total: number;
}

export interface IEstadoCuentas {
  pagadas: number;
  pendientes: number;
  vencidas: number;
  porcentaje_pagadas: number;
  porcentaje_pendientes: number;
  porcentaje_vencidas: number;
}

export interface IUltimoMovimiento {
  id: number;
  cliente: string;
  valor: number;
  estado: string;
  fecha: string;
  link_pago: string | null;
}

export interface IHistoricoPago {
  fecha: string;
  monto: number;
  referencia: string | null;
}

export interface IEstadoSuscripcion {
  plan_nombre: string;
  limite_clientes: number | null;
  limite_servicios: number | null;
  fecha_renovacion: string | null;
  total_pagado: number;
  historico_pagos: IHistoricoPago[];
}

export interface IDashboardData {
  kpis: IDashboardKpi;
  alertas: IAlertaRapida[];
  grafica_facturado_recaudado: IGraficaFacturadoRecaudado[];
  grafica_pagos_por_dia: IGraficaPagosPorDia[];
  clientes_principales: IClientePrincipal[];
  estado_cuentas: IEstadoCuentas;
  ultimos_movimientos: IUltimoMovimiento[];
  estado_suscripcion: IEstadoSuscripcion;
}

