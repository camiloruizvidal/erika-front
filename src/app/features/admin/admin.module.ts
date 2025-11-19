import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { CrearClienteComponent } from './components/clientes/crear-cliente/crear-cliente.component';
import { DetalleClienteComponent } from './components/clientes/detalle-cliente/detalle-cliente.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { DetallePaqueteComponent } from './components/paquetes/detalle-paquete/detalle-paquete.component';
import { CrearPaqueteComponent } from './components/paquetes/crear-paquete/crear-paquete.component';
import { ServiciosComponent } from './components/servicios/servicios.component';
import { CuentasCobroComponent } from './components/cuentas-cobro/cuentas-cobro.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
      },
      {
        path: 'clientes/crear',
        component: CrearClienteComponent,
      },
      {
        path: 'clientes/:id',
        component: DetalleClienteComponent,
      },
      {
        path: 'paquetes',
        component: PaquetesComponent,
      },
      {
        path: 'paquetes/crear',
        component: CrearPaqueteComponent,
      },
      {
        path: 'paquetes/:id',
        component: DetallePaqueteComponent,
      },
      {
        path: 'servicios',
        component: ServiciosComponent,
      },
      {
        path: 'cuentas-cobro',
        component: CuentasCobroComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    ClientesComponent,
    CrearClienteComponent,
    DetalleClienteComponent,
    PaquetesComponent,
    DetallePaqueteComponent,
    CrearPaqueteComponent,
    ServiciosComponent,
    CuentasCobroComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class AdminModule {}
