import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  exito(titulo: string, mensaje?: string): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#7c3aed',
      timer: 3000,
      timerProgressBar: true
    });
  }

  error(titulo: string, mensaje?: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc2626'
    });
  }

  advertencia(titulo: string, mensaje?: string): Promise<any> {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#f59e0b'
    });
  }

  informacion(titulo: string, mensaje?: string): Promise<any> {
    return Swal.fire({
      icon: 'info',
      title: titulo,
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3b82f6'
    });
  }

  confirmar(titulo: string, mensaje?: string, textoConfirmar = 'Sí', textoCancelar = 'No'): Promise<any> {
    return Swal.fire({
      icon: 'question',
      title: titulo,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: textoCancelar,
      confirmButtonColor: '#7c3aed',
      cancelButtonColor: '#6b7280'
    });
  }
}

