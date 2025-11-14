import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPaginado } from '../../interfaces/paginado.interface';

export interface ColumnaTabla {
  nombre: string;
  campo: string;
  ordenable?: boolean;
  ancho?: string;
  formatear?: (valor: any, item: any) => string;
}

@Component({
  selector: 'app-tabla-paginada',
  templateUrl: './tabla-paginada.component.html',
  styleUrls: ['./tabla-paginada.component.scss']
})
export class TablaPaginadaComponent {
  Math = Math;

  @Input() titulo = '';
  @Input() textoBotonCrear = 'Crear nuevo';
  @Input() iconoBotonCrear = 'fa-plus';
  @Input() placeholderBusqueda = 'Buscar...';
  @Input() datos: IPaginado<any> | null = null;
  @Input() cargando = false;
  @Input() columnas: ColumnaTabla[] = [];
  @Input() mostrarBusqueda = true;
  @Input() mostrarPaginacion = true;
  @Input() acciones: boolean = false;

  @Output() crear = new EventEmitter<void>();
  @Output() buscar = new EventEmitter<string>();
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() cambiarTamanoPagina = new EventEmitter<number>();
  @Output() filaClick = new EventEmitter<any>();
  @Output() ordenar = new EventEmitter<{ campo: string; direccion: 'asc' | 'desc' }>();
  @Output() accionSeleccionada = new EventEmitter<{ item: any; accion: string }>();

  terminoBusqueda = '';
  campoOrden: string | null = null;
  direccionOrden: 'asc' | 'desc' = 'asc';

  onBuscar(): void {
    this.buscar.emit(this.terminoBusqueda);
  }

  onCambiarPagina(pagina: number): void {
    this.cambiarPagina.emit(pagina);
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.cambiarTamanoPagina.emit(tamano);
  }

  onCrear(): void {
    this.crear.emit();
  }

  onFilaClick(item: any): void {
    this.filaClick.emit(item);
  }

  onOrdenar(campo: string): void {
    if (this.campoOrden === campo) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.campoOrden = campo;
      this.direccionOrden = 'asc';
    }
    this.ordenar.emit({ campo: this.campoOrden, direccion: this.direccionOrden });
  }

  obtenerValor(item: any, campo: string): any {
    const campos = campo.split('.');
    let valor = item;
    for (const c of campos) {
      valor = valor?.[c];
    }
    return valor ?? '';
  }

  get paginasDisponibles(): number[] {
    if (!this.datos?.meta.total_paginas) {
      return [];
    }
    return Array.from({ length: this.datos.meta.total_paginas }, (_, i) => i + 1);
  }

  onAccionSeleccionada(item: any, accion: string): void {
    this.accionSeleccionada.emit({ item, accion });
  }
}

