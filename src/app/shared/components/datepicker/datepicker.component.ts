import { Component, ElementRef, forwardRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import moment from 'moment';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    }
  ]
})
export class DatepickerComponent implements OnInit, ControlValueAccessor {
  @Input() label = '';
  @Input() required = false;
  @Input() maxDate?: Date;
  @Input() placeholder = 'Seleccione una fecha';
  @ViewChild('calendarContainer', { static: false }) calendarContainer?: ElementRef;

  mostrarCalendario = false;
  mostrarSelectorAnio = false;
  mostrarSelectorMes = false;
  fechaSeleccionada: moment.Moment | null = null;
  fechaMostrada: moment.Moment;
  diasDelMes: number[] = [];
  diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  anosDisponibles: number[] = [];

  edad: number | null = null;
  errorMessage = '';

  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {
    this.fechaMostrada = moment();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.mostrarCalendario && this.calendarContainer) {
      const clickedInside = this.calendarContainer.nativeElement.contains(event.target);
      const clickedInput = this.elementRef.nativeElement.querySelector('input')?.contains(event.target as Node);
      if (!clickedInside && !clickedInput) {
        this.cerrarCalendario();
      }
    }
  }

  ngOnInit(): void {
    if (this.maxDate) {
      this.fechaMostrada = moment(this.maxDate);
    }
    this.generarAnosDisponibles();
    this.generarDiasDelMes();
  }

  generarAnosDisponibles(): void {
    const anoActual = moment().year();
    const anoInicio = anoActual - 120;
    this.anosDisponibles = [];
    for (let ano = anoActual; ano >= anoInicio; ano--) {
      this.anosDisponibles.push(ano);
    }
  }

  writeValue(value: string | null): void {
    if (value) {
      const fechaMoment = moment(value, 'YYYY-MM-DD', true);
      if (fechaMoment.isValid()) {
        this.fechaSeleccionada = fechaMoment;
        this.calcularEdad();
        this.fechaMostrada = fechaMoment.clone();
        this.generarDiasDelMes();
      } else {
        this.fechaSeleccionada = null;
        this.edad = null;
      }
    } else {
      this.fechaSeleccionada = null;
      this.edad = null;
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleCalendario(): void {
    this.mostrarCalendario = !this.mostrarCalendario;
    this.onTouched();
  }

  cerrarCalendario(): void {
    this.mostrarCalendario = false;
    this.mostrarSelectorMes = false;
    this.mostrarSelectorAnio = false;
  }

  seleccionarFecha(fecha: moment.Moment): void {
    const hoy = moment().startOf('day');
    const fechaSeleccionada = fecha.startOf('day');

    if (fechaSeleccionada.isAfter(hoy)) {
      this.errorMessage = 'La fecha no puede ser futura';
      return;
    }

    this.errorMessage = '';
    this.fechaSeleccionada = fecha.clone();
    this.calcularEdad();
    this.mostrarCalendario = false;
    const fechaISO = fecha.format('YYYY-MM-DD');
    this.onChange(fechaISO);
    this.onTouched();
  }

  calcularEdad(): void {
    if (this.fechaSeleccionada) {
      this.edad = moment().diff(this.fechaSeleccionada, 'years');
    }
  }

  mesAnterior(): void {
    this.fechaMostrada = moment(this.fechaMostrada).subtract(1, 'month');
    this.generarDiasDelMes();
  }

  mesSiguiente(): void {
    this.fechaMostrada = moment(this.fechaMostrada).add(1, 'month');
    this.generarDiasDelMes();
  }

  abrirSelectorMes(): void {
    this.mostrarSelectorMes = true;
    this.mostrarSelectorAnio = false;
  }

  abrirSelectorAnio(): void {
    this.mostrarSelectorAnio = true;
    this.mostrarSelectorMes = false;
  }

  seleccionarMes(mes: number): void {
    this.fechaMostrada = moment(this.fechaMostrada).month(mes);
    this.mostrarSelectorMes = false;
    this.generarDiasDelMes();
  }

  seleccionarAnio(ano: number): void {
    const hoy = moment();
    const nuevaFecha = moment(this.fechaMostrada).year(ano);
    
    if (nuevaFecha.isAfter(hoy, 'day')) {
      this.fechaMostrada = hoy;
    } else {
      this.fechaMostrada = nuevaFecha;
    }
    this.mostrarSelectorAnio = false;
    this.generarDiasDelMes();
  }

  esAnioFuturo(ano: number): boolean {
    return moment().year(ano).startOf('year').isAfter(moment(), 'day');
  }

  generarDiasDelMes(): void {
    const inicioMes = moment(this.fechaMostrada).startOf('month');
    const finMes = moment(this.fechaMostrada).endOf('month');
    const diasEnMes = finMes.date();
    const primerDiaSemana = inicioMes.day();

    this.diasDelMes = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      this.diasDelMes.push(0);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      this.diasDelMes.push(dia);
    }
  }

  esHoy(fecha: moment.Moment): boolean {
    return fecha.isSame(moment(), 'day');
  }

  esSeleccionada(fecha: moment.Moment): boolean {
    if (!this.fechaSeleccionada) {
      return false;
    }
    return fecha.isSame(this.fechaSeleccionada, 'day');
  }

  esFutura(fecha: moment.Moment): boolean {
    const hoy = moment().startOf('day');
    return fecha.startOf('day').isAfter(hoy);
  }

  obtenerFechaCompleta(dia: number): moment.Moment {
    return moment(this.fechaMostrada).date(dia);
  }

  get mesAnioTexto(): string {
    return `${this.meses[this.fechaMostrada.month()]} ${this.fechaMostrada.year()}`;
  }

  get fechaFormateada(): string {
    if (!this.fechaSeleccionada) {
      return '';
    }
    return this.fechaSeleccionada.format('DD/MM/YYYY');
  }
}

