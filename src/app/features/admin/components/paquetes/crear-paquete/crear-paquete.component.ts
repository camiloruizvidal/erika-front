import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import moment from 'moment-timezone';
import { IPaginado } from '../../../../../shared/interfaces/paginado.interface';
import { IColumnaTabla } from '../../../../../shared/components/tabla-paginada/tabla-paginada.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import {
  IServicio,
  ICrearPaqueteRequest,
} from '../interfaces/servicio.interface';
import { PaquetesService } from '../../../services/paquetes.service';
import { ServiciosService } from '../../../services/servicios.service';
import {
  EFrecuenciaTipo,
  FrecuenciaTipo,
} from '../../../../../shared/enums/frecuencia-tipo.enum';

@Component({
  selector: 'app-crear-paquete',
  templateUrl: './crear-paquete.component.html',
  styleUrls: ['./crear-paquete.component.scss'],
})
export class CrearPaqueteComponent implements OnInit, OnDestroy {
  Math = Math;
  formulario!: FormGroup;
  servicios: IPaginado<IServicio> | null = null;
  serviciosSeleccionados: Set<number> = new Set();
  serviciosCompletos: Map<number, IServicio> = new Map();
  cargando = false;
  cargandoServicios = false;
  paginaActual = 1;
  tamanoPagina = 10;
  terminoBusqueda = '';
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  EFrecuenciaTipo = EFrecuenciaTipo;
  private busquedaSubject = new Subject<string>();
  private busquedaSubscription?: Subscription;

  columnas: IColumnaTabla[] = [
    { nombre: 'Nombre', campo: 'nombre', ordenable: false },
    {
      nombre: 'Valor',
      campo: 'valor',
      ordenable: false,
      formatear: (valor: number) => {
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
        }).format(valor);
      },
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private paquetesService: PaquetesService,
    private serviciosService: ServiciosService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarServicios();
    this.configurarBusqueda();
  }

  ngOnDestroy(): void {
    if (this.busquedaSubscription) {
      this.busquedaSubscription.unsubscribe();
    }
  }

  private inicializarFormulario(): void {
    const fechaHoy = moment.tz('America/Bogota').format('YYYY-MM-DD');
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      valor: [0, [Validators.required, Validators.min(0)]],
      fecha_inicio: [fechaHoy, [Validators.required]],
      fecha_fin: [null],
      activo: [true],
      frecuencia_tipo: [EFrecuenciaTipo.MENSUAL, [Validators.required]],
      frecuencia_valor: [null],
    });

    this.formulario
      .get('frecuencia_tipo')
      ?.valueChanges.subscribe((frecuenciaTipo) => {
        const frecuenciaValorControl = this.formulario.get('frecuencia_valor');
        if (
          frecuenciaTipo === EFrecuenciaTipo.SEMANAS ||
          frecuenciaTipo === EFrecuenciaTipo.SERVICIOS
        ) {
          frecuenciaValorControl?.setValidators([
            Validators.required,
            Validators.min(1),
          ]);
        } else {
          frecuenciaValorControl?.clearValidators();
          frecuenciaValorControl?.setValue(null);
        }
        frecuenciaValorControl?.updateValueAndValidity();
      });
  }

  private configurarBusqueda(): void {
    this.busquedaSubscription = this.busquedaSubject
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((termino) => {
        this.terminoBusqueda = termino;
        this.paginaActual = 1;
        this.cargarServicios();
      });
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    const params: {
      pagina: number;
      tamano_pagina?: number;
      nombre?: string;
    } = {
      pagina: this.paginaActual,
    };

    if (this.tamanoPagina !== 10) {
      params.tamano_pagina = this.tamanoPagina;
    }

    if (this.terminoBusqueda && this.terminoBusqueda.trim()) {
      params.nombre = this.terminoBusqueda.trim();
    }

    this.serviciosService.listar(params).subscribe({
      next: (respuesta) => {
        this.servicios = respuesta;
        respuesta.data.forEach((servicio) => {
          this.serviciosCompletos.set(servicio.id, servicio);
        });
        this.cargandoServicios = false;
        this.actualizarValorPaquete();
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.cargandoServicios = false;
      },
    });
  }

  onBuscar(termino: string): void {
    this.busquedaSubject.next(termino);
  }

  onLimpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.paginaActual = 1;
    this.busquedaSubject.next('');
  }

  onCambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargarServicios();
  }

  onCambiarTamanoPagina(tamano: number): void {
    this.tamanoPagina = tamano;
    this.paginaActual = 1;
    this.cargarServicios();
  }

  toggleServicio(servicioId: number): void {
    if (this.serviciosSeleccionados.has(servicioId)) {
      this.serviciosSeleccionados.delete(servicioId);
    } else {
      this.serviciosSeleccionados.add(servicioId);
    }
    this.actualizarValorPaquete();
  }

  toggleTodosServicios(): void {
    if (!this.servicios) return;

    const todosSeleccionados = this.servicios.data.every((servicio) =>
      this.serviciosSeleccionados.has(servicio.id)
    );

    if (todosSeleccionados) {
      this.servicios.data.forEach((servicio) => {
        this.serviciosSeleccionados.delete(servicio.id);
      });
    } else {
      this.servicios.data.forEach((servicio) => {
        this.serviciosSeleccionados.add(servicio.id);
        if (!this.serviciosCompletos.has(servicio.id)) {
          this.serviciosCompletos.set(servicio.id, servicio);
        }
      });
    }
    this.actualizarValorPaquete();
  }

  estaSeleccionado(servicioId: number): boolean {
    return this.serviciosSeleccionados.has(servicioId);
  }

  actualizarValorPaquete(): void {
    const valorTotal = this.calcularValorTotal();
    this.formulario.patchValue({ valor: valorTotal });
  }

  calcularValorTotal(): number {
    if (this.serviciosSeleccionados.size === 0) {
      return 0;
    }

    let suma = 0;
    this.serviciosSeleccionados.forEach((servicioId) => {
      const servicio = this.serviciosCompletos.get(servicioId);
      if (servicio) {
        suma += servicio.valor;
      }
    });

    return suma;
  }

  obtenerDiferenciaValor(): {
    diferencia: number;
    porcentaje: number;
    mensaje: string;
    tipo: 'mayor' | 'menor' | 'igual';
  } {
    const valorPaquete = this.formulario.get('valor')?.value || 0;
    const valorServicios = this.calcularValorTotal();

    if (valorServicios === 0) {
      return {
        diferencia: 0,
        porcentaje: 0,
        mensaje: '',
        tipo: 'igual',
      };
    }

    const diferencia = valorPaquete - valorServicios;
    const porcentaje = (diferencia / valorServicios) * 100;

    let mensaje = '';
    let tipo: 'mayor' | 'menor' | 'igual' = 'igual';

    if (Math.abs(porcentaje) < 1) {
      tipo = 'igual';
      mensaje = 'El valor coincide con la suma de servicios';
    } else if (diferencia > 0) {
      tipo = 'mayor';
      mensaje = `El paquete cuesta ${this.formatearNumeroConSeparadores(
        Math.abs(diferencia)
      )} más que la suma de servicios (${porcentaje.toFixed(1)}% más)`;
    } else {
      tipo = 'menor';
      mensaje = `El paquete cuesta ${this.formatearNumeroConSeparadores(
        Math.abs(diferencia)
      )} menos que la suma de servicios (${Math.abs(porcentaje).toFixed(
        1
      )}% menos)`;
    }

    return {
      diferencia: Math.abs(diferencia),
      porcentaje: Math.abs(porcentaje),
      mensaje,
      tipo,
    };
  }

  onFechaInicioChange(fecha: string | null): void {
    this.fechaInicio = fecha;
    this.formulario.patchValue({ fecha_inicio: fecha });
  }

  onFechaFinChange(fecha: string | null): void {
    this.fechaFin = fecha;
    this.formulario.patchValue({ fecha_fin: fecha });
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.serviciosSeleccionados.size === 0) {
      this.notificationService.advertencia(
        'Debe seleccionar al menos un servicio'
      );
      return;
    }

    const serviciosParaEnviar = this.obtenerServiciosSeleccionados();
    const valorFormulario = this.formulario.value.valor;

    const frecuenciaTipo = this.formulario.value
      .frecuencia_tipo as FrecuenciaTipo;

    const fechaInicioColombia = moment
      .tz(this.formulario.value.fecha_inicio, 'America/Bogota')
      .startOf('day');
    const fechaFinColombia = this.formulario.value.fecha_fin
      ? moment
          .tz(this.formulario.value.fecha_fin, 'America/Bogota')
          .startOf('day')
      : null;

    const payload: ICrearPaqueteRequest = {
      nombre: this.formulario.value.nombre,
      valor: valorFormulario,
      fecha_inicio: fechaInicioColombia.format('YYYY-MM-DD'),
      fecha_fin: fechaFinColombia
        ? fechaFinColombia.format('YYYY-MM-DD')
        : null,
      activo: this.formulario.value.activo ?? true,
      frecuencia_tipo: frecuenciaTipo,
      frecuencia_valor:
        frecuenciaTipo === EFrecuenciaTipo.MENSUAL ||
        frecuenciaTipo === EFrecuenciaTipo.ANUAL
          ? null
          : this.formulario.value.frecuencia_valor || null,
      servicios: serviciosParaEnviar,
    };

    this.cargando = true;
    this.paquetesService.crear(payload).subscribe({
      next: () => {
        this.notificationService.exito('Paquete creado exitosamente');
        this.router.navigate(['/admin/paquetes']);
      },
      error: (error) => {
        console.error('Error al crear paquete:', error);
        this.notificationService.error(
          error.error?.message || 'Error al crear el paquete'
        );
        this.cargando = false;
      },
    });
  }

  obtenerServiciosSeleccionados(): {
    nombre_servicio: string;
    valor_servicio: number;
  }[] {
    const servicios: {
      nombre_servicio: string;
      valor_servicio: number;
    }[] = [];

    this.serviciosSeleccionados.forEach((servicioId) => {
      const servicio = this.serviciosCompletos.get(servicioId);
      if (servicio) {
        servicios.push({
          nombre_servicio: servicio.nombre,
          valor_servicio: servicio.valor,
        });
      }
    });

    return servicios;
  }

  obtenerValor(item: any, campo: string): any {
    return campo.split('.').reduce((obj, key) => obj && obj[key], item);
  }

  formatearValor(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(valor);
  }

  formatearNumeroConSeparadores(valor: number | string): string {
    if (!valor && valor !== 0) return '';
    const numero =
      typeof valor === 'string' ? parseFloat(valor.replace(/\./g, '')) : valor;
    if (isNaN(numero)) return '';
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  }

  cancelar(): void {
    this.router.navigate(['/admin/paquetes']);
  }

  obtenerTextoFrecuenciaSemanas(): string {
    const frecuenciaTipo = this.formulario.get('frecuencia_tipo')?.value;
    const frecuenciaValor = this.formulario.get('frecuencia_valor')?.value;
    const fechaInicio = this.formulario.get('fecha_inicio')?.value;

    if (
      frecuenciaTipo !== EFrecuenciaTipo.SEMANAS ||
      !frecuenciaValor ||
      !fechaInicio
    ) {
      return '';
    }

    const fecha = moment.tz(fechaInicio, 'America/Bogota');
    const diasSemana = [
      'domingos',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábados',
    ];
    const diaSemana = diasSemana[fecha.day()];
    const textoSemanas =
      frecuenciaValor === 1 ? 'semana' : `${frecuenciaValor} semanas`;

    return `Se cobrará todos los ${diaSemana} cada ${textoSemanas}`;
  }
}
