import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import moment from 'moment';
import { environment } from '../../../../../../environments/environment';
import { TipoDocumento, CrearClienteRequest } from '../interfaces/cliente.interface';

@Component({
  selector: 'app-crear-cliente',
  templateUrl: './crear-cliente.component.html',
  styleUrls: ['./crear-cliente.component.scss'],
})
export class CrearClienteComponent implements OnInit {
  formulario!: FormGroup;
  tiposDocumento: TipoDocumento[] = [];
  cargando = false;
  errorMessage = '';
  fechaMaxima = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
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
    this.tiposDocumento = [
      { id: 1, nombre: 'Cédula' },
      { id: 2, nombre: 'Tarjeta' },
      { id: 3, nombre: 'Registro Civil' },
      { id: 4, nombre: 'Cédula Ext.' },
      { id: 5, nombre: 'Pasaporte' },
      { id: 6, nombre: 'Permiso PPT' },
      { id: 7, nombre: 'Permiso PEP' },
      { id: 8, nombre: 'NIT PN' },
      { id: 9, nombre: 'DNI' },
      { id: 10, nombre: 'NUIP' },
    ];
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.marcarCamposTocados();
      return;
    }

    this.cargando = true;
    this.errorMessage = '';

    const datos: CrearClienteRequest = {
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
      const fechaMoment = moment(this.formulario.value.fecha_nacimiento, 'YYYY-MM-DD');
      datos.fecha_nacimiento = fechaMoment.format('YYYY-MM-DD');
    }

    if (this.formulario.value.direccion?.trim()) {
      datos.direccion = this.formulario.value.direccion.trim();
    }

    this.http.post(`${environment.apiUrl}/api/v1/customers`, datos).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/admin/clientes']);
      },
      error: (error) => {
        this.cargando = false;
        this.errorMessage =
          error.error?.message ||
          'Error al crear el cliente. Verifica los datos e intenta nuevamente.';
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

