import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListadoBaseComponent } from './components/listado-base/listado-base.component';
import { TablaPaginadaComponent } from './components/tabla-paginada/tabla-paginada.component';

@NgModule({
  declarations: [
    ListadoBaseComponent,
    TablaPaginadaComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ListadoBaseComponent,
    TablaPaginadaComponent
  ]
})
export class SharedModule { }

