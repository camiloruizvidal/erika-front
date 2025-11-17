import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import moment from 'moment';
import {
  ITipoDocumento,
  ICrearClienteRequest,
} from '../interfaces/cliente.interface';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { TIPOS_DOCUMENTO } from '../../../../../shared/constants/tipos-documento.constant';
import { ClientesService } from '../../../services/clientes.service';

@Component({
  selector: 'app-crear-cliente',
  templateUrl: './crear-cliente.component.html',
  styleUrls: ['./crear-cliente.component.scss'],
})
export class CrearClienteComponent implements OnInit {
  formulario!: FormGroup;
  tiposDocumento: ITipoDocumento[] = [];
  cargando = false;
  errorMessage = '';
  fechaMaxima = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private clientesService: ClientesService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTiposDocumento();
  }

  private inicializarFormulario(): void {
    this.formulario = this.formBuilder.group({
      primer_nombre: ['', [Validators.required, Validators.minLength(2)]],
      segundo_nombre: [''],
      primer_apellido: ['', [Validators.required, Validators.minLength(2)]],
      segundo_apellido: [''],
      tipo_documento_id: [1, [Validators.required, Validators.min(1)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: [''],
      identificacion: [''],
      fecha_nacimiento: [''],
      direccion: [''],
      activo: [true],
    });
  }

  cargarTiposDocumento(): void {
    this.tiposDocumento = TIPOS_DOCUMENTO;
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.marcarCamposTocados();
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    const datos: ICrearClienteRequest = {
      primer_nombre: this.formulario.value.primer_nombre.trim(),
      primer_apellido: this.formulario.value.primer_apellido.trim(),
      tipo_documento_id: Number(this.formulario.value.tipo_documento_id),
      correo: this.formulario.value.correo.trim().toLowerCase(),
      activo: this.formulario.value.activo ?? true,
    };

    if (this.formulario.value.segundo_nombre?.trim()) {
      datos.segundo_nombre = this.formulario.value.segundo_nombre.trim();
    }

    if (this.formulario.value.segundo_apellido?.trim()) {
      datos.segundo_apellido = this.formulario.value.segundo_apellido.trim();
    }

    if (this.formulario.value.telefono?.trim()) {
      datos.telefono = this.formulario.value.telefono.trim();
    }

    if (this.formulario.value.identificacion?.trim()) {
      datos.identificacion = this.formulario.value.identificacion.trim();
    }

    if (this.formulario.value.fecha_nacimiento) {
      const fechaMoment = moment(
        this.formulario.value.fecha_nacimiento,
        'YYYY-MM-DD'
      );
      datos.fecha_nacimiento = fechaMoment.format('YYYY-MM-DD');
    }

    if (this.formulario.value.direccion?.trim()) {
      datos.direccion = this.formulario.value.direccion.trim();
    }

    this.clientesService.crear(datos).subscribe({
      next: (cliente) => {
        this.cargando = false;
        this.notificationService
          .exito('Cliente registrado exitosamente')
          .then(() => {
            this.router.navigate(['/admin/clientes', cliente.id]);
          });
      },
      error: (error) => {
        this.cargando = false;
        const mensajeError =
          error.error?.message ||
          'Error al crear el cliente. Verifica los datos e intenta nuevamente.';
        this.notificationService.error('Error al crear cliente', mensajeError);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/clientes']);
  }

  private marcarCamposTocados(): void {
    Object.keys(this.formulario.controls).forEach((key) => {
      const control = this.formulario.get(key);
      control?.markAsTouched();
    });
  }

  get primerNombre() {
    return this.formulario.get('primer_nombre');
  }

  get primerApellido() {
    return this.formulario.get('primer_apellido');
  }

  get tipoDocumentoId() {
    return this.formulario.get('tipo_documento_id');
  }

  get correo() {
    return this.formulario.get('correo');
  }
}
