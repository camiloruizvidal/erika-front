import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { IPaginado } from '../../interfaces/paginado.interface';

@Component({
  selector: 'app-listado-base',
  templateUrl: './listado-base.component.html',
  styleUrls: ['./listado-base.component.scss']
})
export class ListadoBaseComponent {
  Math = Math;

  @Input() titulo = '';
  @Input() textoBotonCrear = 'Crear nuevo';
  @Input() iconoBotonCrear = 'fa-plus';
  @Input() placeholderBusqueda = 'Buscar...';
  @Input() datos: IPaginado<any> | null = null;
  @Input() cargando = false;
  @Input() templateItem: TemplateRef<any> | null = null;
  @Input() mostrarBusqueda = true;
  @Input() mostrarPaginacion = true;

  @Output() crear = new EventEmitter<void>();
  @Output() buscar = new EventEmitter<string>();
  @Output() cambiarPagina = new EventEmitter<number>();
  @Output() cambiarTamanoPagina = new EventEmitter<number>();
  @Output() itemClick = new EventEmitter<any>();

  terminoBusqueda = '';

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

  onItemClick(item: any): void {
    this.itemClick.emit(item);
  }

  get paginasDisponibles(): number[] {
    if (!this.datos?.meta.total_paginas) {
      return [];
    }
    return Array.from({ length: this.datos.meta.total_paginas }, (_, i) => i + 1);
  }
}
