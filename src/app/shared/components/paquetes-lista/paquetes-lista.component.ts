import { Component, Input } from '@angular/core';
import moment from 'moment';

export interface IPaqueteEnLista {
  id: number;
  nombre: string;
  activo: boolean;
  fecha_inicio: string;
  fecha_fin: string | null;
}

@Component({
  selector: 'app-paquetes-lista',
  templateUrl: './paquetes-lista.component.html',
  styleUrls: ['./paquetes-lista.component.scss'],
})
export class PaquetesListaComponent {
  @Input() paquetes: IPaqueteEnLista[] = [];

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '-';
    return moment(fecha).format('DD/MM/YYYY');
  }

  obtenerColorPunto(activo: boolean): string {
    return activo ? 'bg-success-500' : 'bg-error-500';
  }
}
