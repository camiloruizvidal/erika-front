import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { CrearClienteComponent } from './components/clientes/crear-cliente/crear-cliente.component';
import { PaquetesComponent } from './components/paquetes/paquetes.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'clientes',
        component: ClientesComponent
      },
      {
        path: 'clientes/crear',
        component: CrearClienteComponent
      },
      {
        path: 'paquetes',
        component: PaquetesComponent
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminLayoutComponent,
    DashboardComponent,
    ClientesComponent,
    CrearClienteComponent,
    PaquetesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ]
})
export class AdminModule { }

