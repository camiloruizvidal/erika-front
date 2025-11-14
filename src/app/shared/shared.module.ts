import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListadoBaseComponent } from './components/listado-base/listado-base.component';
import { TablaPaginadaComponent } from './components/tabla-paginada/tabla-paginada.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';

@NgModule({
  declarations: [
    ListadoBaseComponent,
    TablaPaginadaComponent,
    DatepickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ListadoBaseComponent,
    TablaPaginadaComponent,
    DatepickerComponent
  ]
})
export class SharedModule { }

