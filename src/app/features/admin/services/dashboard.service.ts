import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IDashboardData } from '../components/dashboard/interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/v1/reportes`;

  constructor(private http: HttpClient) {}

  obtenerDashboard(): Observable<IDashboardData> {
    return this.http.get<IDashboardData>(`${this.apiUrl}/dashboard`);
  }
}

