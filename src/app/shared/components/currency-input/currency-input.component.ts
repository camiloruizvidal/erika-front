import {
  Component,
  ElementRef,
  forwardRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  FormControl,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CurrencyInputComponent),
      multi: true,
    },
  ],
})
export class CurrencyInputComponent
  implements OnInit, ControlValueAccessor, Validator
{
  @Input() label = '';
  @Input() required = false;
  @Input() placeholder = '0';
  @Input() min: number = 0;
  @Input() disabled = false;
  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef<HTMLInputElement>;

  valorDisplay: string = '';
  valorNumerico: number = 0;

  private onChange = (value: number) => {};
  private onTouched = () => {};

  ngOnInit(): void {
    if (this.valorNumerico === 0) {
      this.valorDisplay = '';
    } else {
      this.valorDisplay = this.formatearNumeroConSeparadores(this.valorNumerico);
    }
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

  onFocus(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.select();
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    let valorTexto = input.value;

    const textoAntes = valorTexto.substring(0, cursorPosition);
    const digitosAntes = textoAntes.replace(/[^\d]/g, '').length;

    valorTexto = valorTexto.replace(/[^\d]/g, '');

    if (valorTexto === '') {
      this.valorNumerico = 0;
      this.valorDisplay = '';
      input.value = '';
      this.onChange(0);
      return;
    }

    const valorLimpio = parseFloat(valorTexto);
    if (!isNaN(valorLimpio)) {
      this.valorNumerico = valorLimpio;
      const valorFormateado = this.formatearNumeroConSeparadores(valorLimpio);
      this.valorDisplay = valorFormateado;
      input.value = valorFormateado;
      this.onChange(valorLimpio);

      setTimeout(() => {
        const digitosDespues = valorFormateado.replace(/[^\d]/g, '').length;
        let nuevaPosicion = 0;

        if (digitosDespues > 0) {
          let digitosContados = 0;
          for (let i = 0; i < valorFormateado.length; i++) {
            if (/\d/.test(valorFormateado[i])) {
              digitosContados++;
              if (digitosContados >= digitosAntes) {
                nuevaPosicion = i + 1;
                break;
              }
            }
          }
          if (nuevaPosicion === 0) {
            nuevaPosicion = valorFormateado.length;
          }
        }

        input.setSelectionRange(nuevaPosicion, nuevaPosicion);
      }, 0);
    }
  }

  writeValue(value: number | null | undefined): void {
    if (value === null || value === undefined) {
      this.valorNumerico = 0;
      this.valorDisplay = '';
    } else {
      this.valorNumerico = value;
      this.valorDisplay = this.formatearNumeroConSeparadores(value);
    }
    if (this.inputElement) {
      this.inputElement.nativeElement.value = this.valorDisplay;
    }
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onBlur(): void {
    this.onTouched();
    if (this.inputElement) {
      if (this.valorNumerico === 0) {
        this.valorDisplay = '';
        this.inputElement.nativeElement.value = '';
      } else {
        this.valorDisplay = this.formatearNumeroConSeparadores(
          this.valorNumerico,
        );
        this.inputElement.nativeElement.value = this.valorDisplay;
      }
    }
  }

  validate(control: FormControl): { [key: string]: any } | null {
    if (this.required && (control.value === null || control.value === undefined || control.value === 0)) {
      return { required: true };
    }
    if (this.min !== undefined && control.value !== null && control.value !== undefined && control.value < this.min) {
      return { min: { min: this.min, actual: control.value } };
    }
    return null;
  }
}
